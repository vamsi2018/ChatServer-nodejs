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

	var participatingSockets = [];

	io.sockets.on('connection',function(socket){
		console.log('Someone Connected');
		socket.on('join',function(name){
			socket.nickname=name;
			socket.broadcast.emit('announcement',name + 'joined the chat');
			participatingSockets.push(socket);
			// Allow all the users to know about the online users
			io.sockets.emit('requestedRoster',roster());
		});

		socket.on('text',function(msg){
			socket.broadcast.emit('text',socket.nickname,msg);
		});

		function roster(){
			return participatingSockets.map(function(activeSocket){return activeSocket.nickname});
		}

		socket.on('getRoster',function(){
			socket.emit('requestedRoster',roster());
		});

		socket.on('disconnect',function(){
			console.log(socket.nickname+" is disconnected");
			socket.broadcast.emit('userDisconnect',socket.nickname);
			var disconnectedSocketIndex = participatingSockets.indexOf(socket);
			participatingSockets.splice(disconnectedSocketIndex,1);
		});
			// Allow all the users to know about the online users
			io.sockets.emit('requestedRoster',roster());
	});
