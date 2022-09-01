// dbservice.enums.js
class DbOption {
    //Reference: https://blog.bitsrc.io/explaining-enums-enumerations-in-plain-javascript-895a226622e3
    //Enumerator concept
    static DELETE_ALL_REFRESH_TOKENS = new DbOption('DELETE_ALL_REFRESH_TOKENS',1);
    static DELETE_ONE_REFRESH_TOKEN = new DbOption('DELETE_ONE_REFRESH_TOKEN',2);
    static FIND_ONE_REFRESH_TOKEN_USING_USERID_AND_REFRESH_TOKEN = new DbOption('FIND_ONE_REFRESH_TOKEN_USING_USERID_AND_REFRESH_TOKEN',3);
    static FIND_ONE_USER_USING_REFRESH_TOKEN = new DbOption('FIND_ONE_USER_USING_REFRESH_TOKEN',4);
    static FIND_ONE_USER_USING_EMAIL = new DbOption('FIND_ONE_USER_USING_EMAIL',5);
    static FIND_ALL_TIED_TO_ONE_USER_ID =  new DbOption('FIND_ALL_TIED_TO_ONE_USER_ID',6);
    constructor(key,value) {
      this.key =key;
      this.value=value;
      Object.freeze(this);
    }
  }
//https://stackabuse.com/how-to-use-module-exports-in-node-js/
//I was stuck on how to module.exports JavaScript class. 
  module.exports = {
    DbOption:DbOption
  }