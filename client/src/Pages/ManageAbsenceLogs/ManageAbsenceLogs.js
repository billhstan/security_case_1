import React,{ useEffect, useContext } from 'react';
import { Alert } from 'react-bootstrap';
import styles  from  './ManageAbsenceLogs.module.css';
import AbsenceLogTable from '../../Components/Table/AbsenceLogTable';
import { useNavigate, Link } from "react-router-dom";
import { Context } from '../../Context/appContext';
import {format,parseISO} from 'date-fns';

const Feedback = ({serverSideFeedback})=>{
    const {ok,errors,message}=serverSideFeedback;
    console.log('ManageAbsenceLogs.js>>>Feedback>>>Check the three inputs:');
    console.log('ok',ok);
    console.log('The ok input parameter should have either, null, true or false. As a result, you need to be careful with the conditional statement.');
    console.log((ok==null)?'The ok input is null. Therefore the the else block should execute. ':'The ok input is not null, something should be displayed.');
    console.log('message : ', message?message:'The message variable is empty string');
    console.dir('errors : ' ,errors?errors:'The errors is null.');
    if (ok==true) {
      return (
        <Alert role="alert" className="alert alert-success h-100" variant="success">
          {message}
        </Alert>
      );
    } else if ((ok==false) && message.trim() != '' && errors?.length > 0) {
      return (
        <Alert role="alert" className="alert alert-danger h-100" variant="danger">
          {message}
          {errors.map((element, index) => (
            <p key={index}>{element.message}</p>
          ))}
        </Alert>
      );
    } else if ((ok===false) && message.trim() != '' && errors?.length == 0) {
      return (
        <Alert role="alert" className="alert alert-danger h-100" variant="danger">
          {message}
        </Alert>
      );
    } else {
      return (
        <Alert role="alert" className="h-100" variant="info">
          {message}
        </Alert>
      );
    }
  };

export const ManageAbsenceLogs = () => {
	const { store, actions } = useContext(Context);

	const navigate = useNavigate();
	useEffect(() => {
		console.log('ManageAbsenceLogs.js >>>useEffect[store.absenceLogs]>>>[started]>>>Inspect [store.absenceLogs]');
		console.log(store.absenceLogs);
		console.log('ManageAbsenceLogs.js >>>useEffect[store.absenceLogs]>>>[finished]>>>Inspect [store.absenceLogs]');
	}, [store.absenceLogs]);
	useEffect(() => {
		console.log('ManageAbsenceLogs.js>>>useEffect[]>>>[started]>>>Retrieve data from backend');
		actions.getAbsenceLogs();
		console.log('ManageAbsenceLogs.js>>>useEffect[]>>>[finished]>>>Retrieve data from backend');
	}, []);
	useEffect(() => {
		console.log('ManageAbsenceLogs.js >>>useEffect[store.serverSideFeedback]>>>[started]');
		console.log('Inspect [store.serverSideFeedback] :');
		console.dir(store.serverSideFeedback);
		console.log('ManageAbsenceLogs.js >>>useEffect[store.serverSideFeedback]>>>[finished]');
	}, [store.serverSideFeedback]);

    //Not using this getRowProps for now. I forgot what I used it for. Dare not delete these code.
	const getRowProps = (row) => ({
		onClick: async () => {
			let absenceLogId = row.original.absenceLogId;
			try {
				console.dir('ManageAbsenceLogs.js>>>getRowProps>>>Sstarted]>>Check the [row] variable');
				console.dir(row);
			} catch (error) {
				console.log('ManageAbsenceLogs.js>>>getRowProps>>>onClick method [catch] block>>>[started]!!!');
				console.log('I don\'t know what to write in this catch block. Inspect [error] variable');
				console.dir(error);
			}
		},
		style: {
			cursor: 'pointer',
		},
	}); //End of getRowProps

    //-------- handleButtonClicks ---------
    const handleButtonClicks = async (cell) => {
		//https://github.com/TanStack/table/discussions/2295
		//You need to read a lot of discussions such as the one above to slowly appreciate the
		//cell input parameter which is defined for the handleButtonClicks.
		console.dir('ManageAbsenceLogs.js>>>handleButtonClicks>>>[started]>>Check [cell.column] variable.');
		console.dir(cell.column);
		console.dir('ManageAbsenceLogs.js>>>handleButtonClicks>>>Check [cell.row] variable.');
		console.dir(cell.row);
		console.dir('ManageAbsenceLogs.js>>>handleButtonClicks>>>Check [cell.value] variable.');
		console.dir(cell.value);
		console.dir('ManageAbsenceLogs.js>>>handleButtonClick>>>Check the entire [cell] variable.');
		console.dir(cell);
		console.dir('ManageAbsenceLogs.js>>>handleButtonClick>>>Check [cel?.row?.original].');
		console.dir(cell?.row?.original);
		if (cell.value === 'delete') {
			/*Learning note: Notice that, I never configured the react-table to display the record id but
			the internal logic of react-table has all the data information. I just need to use code to "ask for it".
			For example the following code is trying to obtain the id of the record data */
			let absenceLogId = cell.row.original.absenceLogId;
			console.dir('Inspect [absenceLogId] value :  [', absenceLogId, 
			'] before the client-side starts communicating with the backend to delete.' );
			console.dir('The cell.value property is \'delete\'. Calling actions.deleteAbsenceLog to begin delete absence log flow.');
			await actions.deleteAbsenceLog({ absenceLogId: absenceLogId });
		}
		if (cell.value === 'update') {
			console.dir('ManageAbsenceLogs.js>>>The cell.value property is \'update\'. Navigating the user to the Update Absence Log view.');
			let absenceLogId = cell.row.original.absenceLogId;
			console.dir('Inspect [absenceLogId] value :  [', absenceLogId, 
			'] before the client-side logic starts navigate the user to another view interface.' );
			console.log('ManageAbsenceLogs.js>>>Start calling the navigate(\'/absencelogs/\'' + absenceLogId + ')>>>[started]');
			navigate('/absencelogs/' + absenceLogId);
			console.log('ManageAbsenceLogs.js>>>Start calling the navigate(\'/absencelogs/\'' + absenceLogId + ')>>>[finished)');
		}
	};
	const columns = [
		{
			Header: 'Description',
			accessor: 'description',
			disableFilters: false,
			className: 'text-center ',
		},
		{
			Header: 'Start date and time',
			accessor: 'startDateAndTime',
			Cell: ({ cell: { value } }) => (value ? format(parseISO(value),'yyyy-MM-dd HH:mm'): '-'),
			disableFilters: false,
			className: 'col-sm-4 text-start',
		},
        {
			Header: 'End date and time',
			accessor: 'endDateAndTime',
			Cell: ({ cell: { value } }) => (value ? format(parseISO(value),'yyyy-MM-dd HH:mm') : '-'),
			disableFilters: false,
			className: 'col-sm-4 text-start',
		},
		{
			Header: 'Delete',
			accessor: (str) => 'delete',
			Cell: (props) => (
				<button className='btn btn-secondary' onClick={() => handleButtonClicks(props)}>
					Delete
				</button>
			),
			disableFilters: true,
			className: 'col-sm-1 text-center',
		},
		{
			Header: 'Update',
			accessor: (str) => 'update',
			Cell: (props) => (
				<button className='btn btn-secondary' onClick={() => handleButtonClicks(props)}>
					Update
				</button>
			),
			disableFilters: true,
			className: 'col-sm-1 text-center',
		},
	];
	const rowProperties = (props) => {
		/*The rowProperties method does not contribute to the main user flow logic in
            this ManageAbsenceLogs.js. The method was created to investigate and familiarize with
            e and props object. The method was created to familiarize with how [row level] actions
            and customization can be achieved for future code challenges */
		return {
			onClick: (e) => {
				console.log('ManageAbsenceLogs.js>>>rowProperties>>>The onClick defined insde rowProperties>>>Check the [e] variable');
				console.dir(e);
				console.log('ManageAbsenceLogs.js>>>rowProperties>>>The onClick defined insde rowProperties>>>Check the [props] variable');
				console.dir(props);
			},
			style: {
				cursor: 'auto',
			},
		};
	};

	return (
		<div className='container-fluid h-100 border'>
			<div className='row border border-secondary  p-1 m-1'>
				<div className='col-sm-2'></div>
				<div className='col-sm-8 p-1 m-1 text-start border'>
					<h3 className=''>Manage absence logs</h3>
				</div>
				<div className='col-sm-2'></div>
			</div>
			<div className='row border border-secondary  p-1 m-1'>
				<div className='col-sm-2'></div>
				<div className='col-sm-8 p-1 m-1 text-start border' style={{ height: '120px' }}>
					<Feedback serverSideFeedback={store.serverSideFeedback} />
				</div>
				<div className='col-sm-2'></div>
			</div>

			<div className='row border border-secondary  p-1 m-1'>
				<div className='col-sm-1'></div>
				<div className='col-sm-10 align-item-center p-2'>
					<div className='d-flex justify-content-end'>
						<Link to='/absencelogs/add'>
							<button className='btn btn-primary'>Add absence log</button>
						</Link>
					</div>
					<div className='d-flex justify-content-center'>
						<AbsenceLogTable columns={columns} data={store.absenceLogs} getRowProps={rowProperties} />
					</div>
				</div>
				<div className='col-sm-1'></div>
			</div>
		</div>
	);
};;

export default ManageAbsenceLogs;