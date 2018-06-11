var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');
var fs = require('fs');
var qs = require('querystring');
var md5 = require('md5');
var cookie = require('cookie');
//Database Connection
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "adm",
    password: "password",
    database: "chat1"
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
//dummy data 
var messages = [{
    id: 1,
    text: "hola soy un mensaje",
    author: "carlos"
}];
//node config for public folder
app.use(express.static('public'));
//socket connection
io.on('connection', function(socket) {
    console.log('alguien se ha conectado con socket');
    socket.emit('messages', messages);
    socket.on('new-message', function(data) {
        messages.push(data);
        io.sockets.emit('messages', messages);
    })
});
//
server.listen(8080, function() {
    console.log('Servidor corriendo en http://localhost:8080');
});
//Routing
app.get('/chat', function(req, res) {
    var cookies = parseCookies(req);
    var sql = "SELECT CASE WHEN COUNT( * ) >= 1 THEN 'TRUE' ELSE 'FALSE' END As shouldPass FROM chat1.users where digital_signature = '" + cookies.Authorization + "'";
    con.query(sql, function(err, result) {
        if (err) throw err;
        console.log(result[0].shouldPass);
        if (result[0].shouldPass === "TRUE") {
            fs.readFile('public/chat.html', null, function(error, data) {
                console.log(error);
                if (error) {
                    res.writeHead(404);
                    res.write('File not found!');
                } else {
                    res.write(data);
                }
                res.end();
            });
        } else {
            res.status(401).send("Not Authorized");
        }
    });
});
app.get('/login', function(req, res) {
    fs.readFile('public/login.html', null, function(error, data) {
        if (error) {
            res.writeHead(404);
            res.write('File not found!');
        } else {
            res.write(data);
        }
        res.end();
    });
});
app.post('/login', function(req, res) {
    if (req.method == 'POST') {
        var body = '';
        req.on('data', function(data) {
            body += data;
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) {
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE req
                req.connection.destroy();
            }
        });
        req.on('end', function() {
            var POST = qs.parse(body);
            var sql = "SELECT CASE WHEN COUNT( * ) >= 1 THEN 'TRUE' ELSE 'FALSE' END As wasAbleToLog, (select id FROM chat1.users where username = '" + POST.username + "' and password = '" + POST.password + "' ) as id FROM chat1.users where username = '" + POST.username + "' and password = '" + POST.password + "'";
            con.query(sql, function(err, result) {
                if (err) throw err;
                if (result[0].wasAbleToLog === "TRUE") {
                    var hash = md5(new Date());
                    var sql2 = "update chat1.users set digital_signature = '" + hash + "' where id = " + result[0].id;
                    con.query(sql2, function(err2, result2) {
                        if (err2) throw err2;
                        res.status(200).send(hash);
                    });
                } else {
                    console.log("401");
                    res.status(401).send("Not Authorized");
                }
            });
        });
    }
    // fs.readFile('public/login.html', null, function(error, data) {
    //     console.log(error);
    //     if (error) {
    //         res.writeHead(404);
    //         res.write('File not found!');
    //     } else {
    //         res.write(data);
    //     }
    //     res.end();
    // });
});
app.post('/register', function(req, res) {
    if (req.method == 'POST') {
        var body = '';
        req.on('data', function(data) {
            body += data;
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) {
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE req
                req.connection.destroy();
            }
        });
        req.on('end', function() {
            var POST = qs.parse(body);
            var sql = "INSERT INTO users (username, password) VALUES ('" + POST.username + "', '" + POST.password + "')";
            con.query(sql, function(err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
        });
    }
    res.status(200).send("Hello World!");
});
//ROUTING ENDS
function responseParser(argument) {}

function parseCookies(request) {
    var list = {},
        rc = request.headers.cookie;
    rc && rc.split(';').forEach(function(cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
}