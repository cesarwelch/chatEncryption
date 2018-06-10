var mysql = require('mysql');
var con = mysql.createConnection({
    host: "root@localhost",
    user: "adm",
    password: "password"
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE chat1", function(err, result) {
        if (err) throw err;
        console.log("Database created");
    });
});


CREATE USER 'adm'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON * . * TO 'adm';