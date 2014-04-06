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
	//io.set('transports',['xhr-polling']);
	//var participatingSockets = [];
	var participatingSockets = {};

	//uniqueId -> ([chatters])
	var idChattersMap ={};
/*Mode 
 * */
	var IS_DEV=true;

	io.sockets.on('connection',function(socket){
		console.log("Client connecting to server from " + socket.handshake.address.address);
		socket.on('join',function(name){
			socket.nickname=name;
			if(!isThisClientIpRegistered(socket)||IS_DEV){
				//socket.broadcast.emit('announcement',name + ' joined the chat');
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

			var anonymousChatIdArray = socket.anonymousChat;

			// If anonymousChatIdArray is undefined, then it iplies that this 
			// socket hasn't participatedin anonymous chat
			if(anonymousChatIdArray != undefined){
				var remoteSocket={};
				for(var index=0;index<anonymousChatIdArray.length;index++){
					remoteSocket = getAnonymousReceiverSocket(anonymousChatIdArray[index],socket);
					if(remoteSocket != undefined){
						remoteSocket.emit('anonymousMessage',"Your partner left the chat",anonymousChatIdArray[index],1);
						var remoteSocketAnonymousChatIdindex = remoteSocket.anonymousChat.indexOf(anonymousChatIdArray[index]);
						remoteSocket.anonymousChat.splice(index,1);
					}
					delete idChattersMap[anonymousChatIdArray[index]];
				}
			}
			delete participatingSockets[socket.nickname];
		});

		socket.on('private-chat',function(msg,to){
		 var toSocket = getSocket(to);
		 if(toSocket!=undefined){
			 toSocket.emit('private-chat',socket.nickname,msg);
		 }
		});
		
		// Allow all the users to know about the online users
		io.sockets.emit('requestedRoster',roster());

		socket.on('private-chat-anonymous',function(){
			var id = getRandomUniqueId();
			var randomOnlineChatter = getRandomOnlineChatter(socket);
			idChattersMap[id]=[];
			idChattersMap[id].push(socket);
			idChattersMap[id].push(randomOnlineChatter);
			if(socket.anonymousChat == undefined){
				socket.anonymousChat = [];
			}
			socket.anonymousChat.push(id);
			if(randomOnlineChatter.anonymousChat == undefined){
				randomOnlineChatter.anonymousChat = [];
			}
			randomOnlineChatter.anonymousChat.push(id);

			socket.emit('anonymousMessage',"Welcome To Anonymos Chatting Area !!!!",id,1);
			randomOnlineChatter.emit('anonymousMessage',"Welcome To Anonymos Chatting Area !!!!",id,1);

		});

		function getAnonymousReceiverSocket(randomId,theSocket){
			var chattersArray = idChattersMap[randomId];
			console.dir(idChattersMap);
			console.log(randomId);
			console.log(chattersArray);
			// If chattersArray is undefined it means that the coresponding chat has been 
			// disabled as one of the chatters has left the chat room
			if(chattersArray != undefined){
				for(var chatterIndex=0;chatterIndex<chattersArray.length;chatterIndex++){
					var chatter = chattersArray[chatterIndex];
					if(chatter != theSocket){
						var receiverSocket = chatter;
						break;
					}
				}
				return receiverSocket;	
			}
			return null;
		}
		socket.on('anonymousMessage',function(msg,randomId){
			var receiverSocket = getAnonymousReceiverSocket(randomId,socket);
			if(receiverSocket != null){
				receiverSocket.emit('anonymousMessage',msg,randomId,0);
			}else{
				socket.emit("anonymousMessage","Your partner left the chat room and your messages do not reach your partner",randomId,1);
			}
		});
	});



	function getSocket(nickName){
		return participatingSockets[nickName];
		
	}

	function getRandomOnlineChatter(mySocket){
		var randomSocket = mySocket;
		var nickNamesArray = Object.keys(participatingSockets);
		while(randomSocket.nickname == mySocket.nickname){
			var nickNamesArrayLength = nickNamesArray.length;
			var randomIndex = Math.floor((Math.random()*nickNamesArrayLength));
			randomSocket = participatingSockets[nickNamesArray[randomIndex]];
		}
		return randomSocket;
	}

	function getRandomUniqueId(){
		function S4() {
			 return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			  }
		function guid() {
			 return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		}
		return guid();
	}

	function isThisClientIpRegistered(newSocket){
		for(name in participatingSockets){
			if(participatingSockets[name].handshake.address.address === newSocket.handshake.address.address){
				return true;
			}
		}
		return false;
	}
