var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');
var fs = require('fs');
var qs = require('querystring');
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
module.exports = {
    handleRequest: function(request, response) {
        console.log(response);
        console.log(request);
    }
};
//Routing
app.get('/chat', function(req, res) {
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
});
app.get('/login', function(req, res) {
    fs.readFile('public/login.html', null, function(error, data) {
        console.log(error);
        if (error) {
            res.writeHead(404);
            res.write('File not found!');
        } else {
            res.write(data);
        }
        res.end();
    });
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
            var sql = "INSERT INTO users (username, password) VALUES ('"+POST.username+"', '"+POST.password+"')";
            con.query(sql, function(err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
            
        });
    }
    res.status(200).send("Hello World!");
});
//ROUTING ENDS