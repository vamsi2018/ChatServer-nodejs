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

	//var participatingSockets = [];
	var participatingSockets = {};

/*Mode 
 * */
	var IS_DEV=true;

	io.sockets.on('connection',function(socket){
		console.log("Client connecting to server from " + socket.handshake.address.address);
		socket.on('join',function(name){
			socket.nickname=name;
			if(!isThisClientIpRegistered(socket)||IS_DEV){
				socket.broadcast.emit('announcement',name + 'joined the chat');
				socket.ip =socket.handshake.address.address ;
				//participatingSockets.push(socket);
				participatingSockets[socket.nickname]=socket;
				// Allow all the users to know about the online users
				io.sockets.emit('requestedRoster',roster());
			}else{
				socket.emit('alreadyRegistered',{});	
			}
		});

		socket.on('text',function(msg){
			socket.broadcast.emit('text',socket.nickname,msg);
		});

		function roster(){
			//return participatingSockets.map(function(activeSocket){return activeSocket.nickname});
			return Object.keys(participatingSockets);
		}

		socket.on('getRoster',function(){
			socket.emit('requestedRoster',roster());
		});

		socket.on('disconnect',function(){
			console.log(socket.nickname+" is disconnected");
			socket.broadcast.emit('userDisconnect',socket.nickname);

			//var disconnectedSocketIndex = participatingSockets.indexOf(socket);
			//participatingSockets.splice(disconnectedSocketIndex,1);
			delete participatingSockets[socket.nickname];
		});

		socket.on('private-chat',function(msg,to){
		 var toSocket = getSocket(to);
		 toSocket.emit('private-chat',socket.nickname,msg);
		});
		
		// Allow all the users to know about the online users
		io.sockets.emit('requestedRoster',roster());
	});


	function getSocket(nickName){
		return participatingSockets[nickName];
		
	}


	function isThisClientIpRegistered(newSocket){
		for(name in participatingSockets){
			if(participatingSockets[name].handshake.address.address === newSocket.handshake.address.address){
				return true;
			}
		}
		return false;
	}
