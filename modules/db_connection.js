var mysql = require('mysql');
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "adm",
    password: "password",
    database: "chat1"
});


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE messages( id int unique primary key not null AUTO_INCREMENT, message nvarchar(500) not null, sender nvarchar(250) not null, receiver nvarchar(250) not null, timestamp datetime );";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});