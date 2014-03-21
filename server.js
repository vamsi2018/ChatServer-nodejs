/*
 *Module Dependencies
 * */

var express = require('express')
		,sio = require('socket.io');

/*
 *Create App
 * */
	app = express.createServer(
				express.bodyParser(),
				express.static('public')
			);

/*Listen
 * */
	app.listen(3000);

	var io = sio.listen(app);

	io.sockets.on('connection',function(socket){
		console.log('Someone Connected');
		socket.on('join',function(name){
			socket.nickname=name;
			socket.broadcast.emit('announcement',name + 'joined the chat');
		});

		socket.on('text',function(msg){
			socket.broadcast.emit('text',socket.nickname,msg);
		});
	});
