const mysql      = require('mysql');

const DBConnection = function(){

	return mysql.createConnection({
	  host     : '127.0.0.1',
	  port: '3307',
	  user     : 'root',
	  password : '',
	  database : 'biz_tag'
	});

}


module.exports = DBConnection;
