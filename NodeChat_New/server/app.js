var express = require('express');
var app = express();
var http = require('http').Server(app);

var webroot = __dirname + '/../client/';

app.use('/', express.static(webroot));

var server = http.listen(3000, function () {
    console.log('hosting from ' + webroot);
    console.log('server listening on http://localhost/');
});

var users = [];

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

    var mes = {
        text: '<p>Hello</p>'
    };
    var clientIp = socket.request.connection.remoteAddress;

    console.log('socket connected from ' + clientIp);

    socket.emit('welcome', mes);

    socket.on('user', function (name) {
        console.log(name + ' connected');
        users.push(name);
        socket.user = name;
        console.log('users : ' + users.length);
        socket.broadcast.emit('otherUserConnect', name);
    });

    socket.on('disconnect', function () {
        if (!socket.user) {
            return;
        }
        if (users.indexOf(socket.user) > -1) {
            console.log(socket.user + ' disconnected');
            users.splice(users.indexOf(socket.user), 1);
            socket.broadcast.emit('otherUserDisconnect', socket.user);
        }
    });

    socket.on('message', function (data) {
        console.log(socket.user + ': ' + data);
        io.sockets.emit('message', {
            user: socket.user,
            message: data
        });
    });
});
