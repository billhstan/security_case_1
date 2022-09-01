(async function() {
	const mysql= require('./src/utils/mysql2');
	const bcrypt = require('bcryptjs');
	const chalk = require('chalk');
	const util = require('util');
	const fns = require('date-fns');

	const createUserRecord = async ({firstName,lastName,email,password,roleName,courseAbbreviation,admissionId}) => {
		console.log(chalk.blue('createUserRecord method>>>[started]'));
		/**
		 * createUserRecord function argument uses named args with destructuring technique
		 */
	    const connection = await mysql.connection();
		try {
			const salt = bcrypt.genSaltSync(10); //Level of salt shall be 10;
            let hashedPassword = await bcrypt.hash(password, salt);
			console.log(chalk.yellow(`createUserRecord>>>mysql connection>>>[begin transation]`));
            await connection.query('START TRANSACTION');
			console.log(`createUserRecord>>>creating user record ${firstName} ${lastName} >>>[started]`);
			const insertUserResult = await connection.query(`INSERT INTO users(first_name,last_name,email,
				admission_id,course_id,role_id,password)
	  VALUES (?,?,?,?,(SELECT course_id FROM courses WHERE course_abbreviation=?),
	  (SELECT role_id FROM user_roles WHERE role_name=?),?);`, 
	  [firstName,lastName,email,admissionId,courseAbbreviation,roleName,hashedPassword]);
	  console.log(chalk.blueBright(util.inspect(insertUserResult, showHidden=false, depth=2, colorize=true)));
			const newUserId = insertUserResult.insertId;
			console.log(chalk.blue(`createUserRecord>>>Inspect [userId] variable>>>`));		
			console.log(chalk.blueBright(newUserId));		
			await connection.query('COMMIT');
			console.log(chalk.yellow(`createUserRecord>>>mysql connection>>>[commit]`));
			return;
		} catch (error) {
			console.log(chalk.red(`createUserRecord>>[catch] block>>>[started]!!!`));
			console.log(chalk.yellow(`createUserRecord>>>mysql connection>>>[rollback]`));
			await connection.query('ROLLBACK');
			console.log(chalk.red(`createUserRecord>>[catch] block>>>[throw error] started!!!`));
			throw error;
		} finally {
		//The following command will still execute even if there is a return statement inside the [try] block
		console.log(chalk.blue(`createUserRecord>>>[finally] block>>>[started]`));		
			console.log(chalk.yellow(`createUserRecord>>>mysql connection>>>[connection.release()]`));
			await connection.release();
			console.log(chalk.blue(`createUserRecord>>>[finally] block>>>[ended]`));		
		}
		//The following command will not execute due to the return inside the [try] block
		//console.log(chalk.blue('createUserRecord method>>>[finished]'));
	}//End of createUserRecord  method    

	const createRoleRecord = async ({roleName}) => {
		console.log(chalk.blue('createRoleRecord method>>>[started]'));
		const connection = await mysql.connection();
		try {
			await connection.query('START TRANSACTION');
			console.log(`createRoleRecord>>>Creating role record  ${ roleName}`);
			const insertRoleResult = await connection.query(`INSERT INTO user_roles(role_name)
	  VALUES (?) ;`, [roleName]);
			const newRoleId = insertRoleResult.insertId
			console.log(chalk.blue(`createRoleRecord>>>Inspect [newRoleId] variable>>>`));		
			console.log(chalk.blueBright(newRoleId));		
			await connection.query('COMMIT');
			return; //Exit from the createRoleRecord
			//But the nodejs will still execute the code inside the [finally] block
		} catch (error) {
			await connection.query('ROLLBACK');
			throw error;
		} finally {
			await connection.release();
		}
	}//End of createRoleRecord  method    
	const createCourseRecord = async ({courseAbbreviation,courseName}) => {
		console.log(chalk.blue('createCourseRecord method>>>[started]'));
		const connection = await mysql.connection();
		try {
			await connection.query('START TRANSACTION');
			console.log('createCourseRecord>>>Creating course record ', courseAbbreviation);
			const result = await connection.query(`INSERT INTO courses (course_abbreviation,course_name)
	  VALUES (?,?) ;`, [courseAbbreviation,courseName]);
			const  newCourseId = result.insertId;
			console.log(chalk.blue(`createRoleRecord>>>Inspect [newCourseId] variable>>>`));		
			console.log(chalk.blueBright(newCourseId));		
			await connection.query('COMMIT');
			return;
		} catch (err) {
			await connection.query('ROLLBACK');
			throw err;
		} finally {
			await connection.release();
		}
	}//End of createCourseRecord  method    
	const fetchAllRoles = async () => {
		console.log(chalk.blue('fetchAllRoles method>>>[started]'));
		
		const connection = await mysql.connection();
		try {
			const result = await connection.query(`SELECT role_id, role_name FROM user_roles;`);
			roles = result.map(function(element) {
				return {roleId:element.role_id,roleName:element.role_name}
			});
			return roles;
		} catch (error) {
			throw error;
		} finally {
			await connection.release();
		}
	}//End of fetchAllRoles  method    

	const fetchAllCourses = async () => {
		console.log(chalk.blue('fetchAllCourses method>>>[started]'));
		
		const connection = await mysql.connection();
		try {
			const result = await connection.query(`SELECT course_id,course_name,course_abbreviation FROM courses;`);
			courses = result.map(function(element) {
				return {courseId:element.course_id,
					courseName:element.course_name,
					courseAbbreviation:element.course_abbreviation}
			});
			return courses;
		} catch (error) {
			throw error;
		} finally {
			await connection.release();
		}
	}//End of fetchAllCourses  method    

	const fetchUsers = async (roleName) => {
		//Provide roleName 'ADMIN', 'STUDENT' etc.
		console.log(chalk.blue('fetchUsers method>>>[started]'));
		
		const connection = await mysql.connection();
		try {
			const result = await connection.query(`SELECT user_id,first_name,last_name,admission_id,email,user_roles.role_name,
			courses.course_abbreviation,users.created_at
			FROM users INNER JOIN user_roles ON users.role_id=user_roles.role_id 
			INNER JOIN courses ON users.course_id = courses.course_id WHERE user_roles.role_name=?;`,[roleName]);
			users = result.map(function(element) {
				return {userId:element.user_id,
					first_name:element.first_name,
					last_name:element.last_name,
				    email:element.email,
				    admissionId: element.admission_id,
					courseAbbreviation: element.course_abbreviation,
				    roleName: element.role_name,
					createdAt:element.created_at,
				   }
			});
			return users;
		} catch (error) {
			throw error;
		} finally {
			await connection.release();
		}
	}//End of fetchUsers  method    

	const dataForSeeding ={
	roles : [
		{roleId:0,roleName:'ADMIN'},
		{roleId:0,roleName:'OFFICER'},
		{roleId:0,roleName:'STUDENT'},
	],	
courses : [
	{courseId:0,courseAbbreviation:'NA',courseName:'NOT APPLICABLE'},
	{courseId:0,courseAbbreviation:'DIT',courseName:'DIPLOMA IN INFORMATION TECHNOLOGY'},
	{courseId:0,courseAbbreviation:'DISM',courseName:'DIPLOMA INFOCOMM SECURITY MANAGEMENT'},
	{courseId:0,courseAbbreviation:'DAAA',courseName:'DIPLOMA IN APPLIED AI AND ANALYTICS'},
],
//Data engineering knowledge: Refer to the https://www.nus.edu.sg/oam/docs/default-source/default-document-library/nameformatexplanationguide.pdf
//on first name and last name concepts.
students:[
  {userId:0,firstName:'BEE LENG, JESSIE',lastName:'TAN',password:'password', courseAbbreviation:'DIT', 
  roleName:'STUDENT',admissionId:'8888001',email:'tan.bee.leng.jessie@skill.com.sg'},
  {userId:0,firstName:'ZHI WEI, DAVID',lastName:'YEO',password:'password', courseAbbreviation:'DIT',
  roleName:'STUDENT',admissionId:'8888002',email:'zhi.wei.david.yeo@skill.com.sg'},
  {userId:0,firstName:'ALI',lastName:'BIN MOHD HASSAN',password:'password', courseAbbreviation:'DIT',
  roleName:'STUDENT',admissionId:'8888003',email:'ali.bin.mohd.hassan@skill.com.sg'},
  {userId:0,firstName:'DEVI',lastName:'RAJARATNAM',password:'password', courseAbbreviation:'DAAA',
  roleName:'STUDENT',admissionId:'8888004',email:'devi.rajaratnam@skill.com.sg'},
  {userId:0,firstName:'ESTER',lastName:'LIM',password:'password', courseAbbreviation:'DAAA',
  roleName:'STUDENT',admissionId:'8888005',email:'ester.lim@skill.com.sg'},
  {userId:0,firstName:'JACOB',lastName:'WELLS',password:'password', courseAbbreviation:'DAAA',
  roleName:'STUDENT',admissionId:'8888006',email:'jacob.wells@skill.com.sg'},
  {userId:0,firstName:'MAY',lastName:'ADAMS',password:'password', courseAbbreviation:'DISM',
  roleName:'STUDENT',admissionId:'8888007',email:'may.adams@skill.com.sg'},
  {userId:0,firstName:'FIN',lastName:'LEE',password:'password', courseAbbreviation:'DISM',
  roleName:'STUDENT',admissionId:'8888008',email:'fin.lee@skill.com.sg'},
  {userId:0,firstName:'ANN',lastName:'LOW',password:'password', courseAbbreviation:'DISM',
  roleName:'STUDENT',admissionId:'8888008',email:'ann.low@skill.com.sg'},
  {userId:0,firstName:'BEE',lastName:'TAN',password:'password', courseAbbreviation:'DIT',
  roleName:'STUDENT',admissionId:'8888008',email:'bee.tan@skill.com.sg'},
],
officers:[
	{userId:0,firstName:'BEN',lastName:'TAN',password:'password', courseAbbreviation:'NA', 
	roleName:'OFFICER',admissionId:'NA',email:'ben.tan@skill.com.sg'},
	{userId:0,firstName:'EDWARD',lastName:'YEO',password:'password', courseAbbreviation:'NA',
	roleName:'OFFICER',admissionId:'NA',email:'edward.yeo@skill.com.sg'},
	{userId:0,firstName:'SUSAN',lastName:'KRIS',password:'password', courseAbbreviation:'NA',
	roleName:'OFFICER',admissionId:'NA',email:'susan.kris@skill.com.sg'},
	{userId:0,firstName:'SARAH',lastName:'LEE',password:'password', courseAbbreviation:'NA',
	roleName:'OFFICER',admissionId:'NA',email:'sarah.lee@skill.com.sg'},
	{userId:0,firstName:'DEN',lastName:'BERK',password:'password', courseAbbreviation:'NA',
	roleName:'OFFICER',admissionId:'NA',email:'den.berk@skill.com.sg'},
  ],
  administrators:[
	{userId:0,firstName:'JIM',lastName:'SHAW',password:'password', courseAbbreviation:'NA', 
	roleName:'ADMIN',admissionId:'NA',email:'jim.shaw@skill.com.sg'},
	{userId:0,firstName:'BELL',lastName:'YEO',password:'password', courseAbbreviation:'NA',
	roleName:'ADMIN',admissionId:'NA',email:'bell.yeo@skill.com.sg'}
  ],
};              
console.time('mysql2');
try{
	 for(index=0;index<dataForSeeding.roles.length;index++){
		console.log('Creating role data');
		await createRoleRecord(dataForSeeding.roles[index]);
	}
	const roleData = await fetchAllRoles();
	console.log(chalk.rgb(50,255,100)(util.inspect(roleData,showHidden=false,colorize=true,depth=2)));
	
	for(index=0;index<dataForSeeding.courses.length;index++){
		console.log('Creating course data');
		await createCourseRecord(dataForSeeding.courses[index]);
	}
	
	//Merging arrays using spread operator technique (Immutable merging technique)
	let users = [...dataForSeeding.students, ...dataForSeeding.officers, ...dataForSeeding.administrators];
	for(index=0;index<users.length;index++){
		console.log('Creating user data');
		await createUserRecord(users[index]);
	}
}catch(error){
	console.log(chalk.redBright(`for loop for create user record logic's [error] block>>>[started]!!!`))
	console.log(chalk.redBright(util.inspect(error, showHidden=false, depth=2, colorize=true)));
}
const userData = await fetchUsers('STUDENT');
console.log(chalk.rgb(50,255,100)(util.inspect(userData,showHidden=false,colorize=true,depth=2)));	
console.timeEnd('mysql2');
	process.exit();
})();