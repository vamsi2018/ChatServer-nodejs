window.onload = function(){
	socket = io.connect();
	socket.on('connect',function(){

		// Send a join event with your name
		var nickname =prompt('What is your nickname') ;
		socket.nickname = nickname.replace(/\ /g,'-');
		socket.emit('join',socket.nickname);
		document.getElementById('input').focus();
		// show the chat
		document.getElementById('chat').style.display = 'block';

		socket.on('announcement',function(msg){
			var li = document.createElement('li');
			li.className='announcement';
			li.innerHTML= msg;
			document.getElementById('messages').appendChild(li);
		});
		
		socket.on('userDisconnect',function(name){
			var li = document.createElement('li');
			li.className='userDisconnected';
			li.innerHTML= name + ' disconnected!!!';
			document.getElementById('messages').appendChild(li);
			
			var rosterDiv = document.getElementById('rosterDiv');
			var disconnectedUserDiv = document.getElementById(name+'Conn');
			console.log("Removing "+name+"Conn");
			rosterDiv.removeChild(disconnectedUserDiv);
		});

		socket.on('alreadyRegistered',function(){
			document.body.innerHTML = 'You are already connected with this IP';
		})
	});

	function addMessage(from,text){
		var li = document.createElement('li');
		li.className = 'message';
		if(from == "me"){
			li.style.float='left';
			li.innerHTML = '<b>' + from + '</b> : ' + text+'<br>';
		}
		else{
			li.style.float='right';
			li.innerHTML = text+ ': <b>' + from + '</b><br>';
		}
		document.getElementById('messages').appendChild(li);
	}

	var input = document.getElementById('input');
	document.getElementById('form').onsubmit = function(){
		addMessage('me',input.value);
		socket.emit('text',input.value);

		// reset the input
		input.value = '';
		input.focus();

		return false;
	}

	socket.on('text',addMessage);

	socket.on('private-chat',function(to,msg){
		initiateChatWith(to);
		var toDiv = document.getElementById(to+'ChatDiv');
		addPrivateMessage(toDiv.id,to,msg);
	});
	socket.on('requestedRoster',function(activeConnectionNames){
		var nicknameIndex = activeConnectionNames.indexOf(socket.nickname);
		activeConnectionNames.splice(nicknameIndex,1);
		var rosterDiv = document.getElementById('rosterDiv');
		rosterDiv.innerHTML = "";
		for(var index=0;index<activeConnectionNames.length;index++){
			var connDiv = document.createElement('div');
			connDiv.id = activeConnectionNames[index]+'Conn';
			connDiv.className = 'activeConnectionClass';
			connDiv.setAttribute('onclick','initiateChatWith(\''+activeConnectionNames[index]+'\')');
			var label = document.createElement('label');
			label.textContent =activeConnectionNames[index];
 			connDiv.appendChild(label);
			rosterDiv.appendChild(connDiv);
		}
	});
}

function getRoster(){
	socket.emit('getRoster',"");
}


function initiateChatWith(name){
	var chatDiv = document.getElementById(name+'ChatDiv');
	if(chatDiv === null){
	
		//create the chat div here with input boxes and messages stuff
		chatDiv = document.createElement('div');
		chatDiv.id = name+'ChatDiv';
		// Create the elements of this chat
		var ul = document.createElement('ul');
		ul.id = chatDiv.id+'-messages';
		chatDiv.appendChild(ul);
		chatDiv.setAttribute('data-to',name);
		var form = document.createElement('form');
		form.id = chatDiv.id + '-form';
		var footerDiv = document.createElement('div');
		footerDiv.id='footer';
		var input = document.createElement('input');
		input.id = chatDiv.id + '-input';
		input.type='text';
		input.class = 'textInput';
		input.style.width='75%';
		var sendButton = document.createElement('button');
		sendButton.innerText='Send';
		footerDiv.appendChild(input);
		footerDiv.appendChild(sendButton);
		form.appendChild(footerDiv);
		form.onsubmit = function(){
			formSubmit(chatDiv.id);
			return false;
		};
		chatDiv.appendChild(form);
		var chat = document.getElementById('chat');
		chat.appendChild(chatDiv);
		$('#chat').tabs('add','#'+chatDiv.id,name);
		$('#chat').tabs('select','#'+chatDiv.id);
		$('#'+chatDiv.id).focus();
	}else{
		// focus the already initiated chat div
		$('#chat').tabs('select','#'+chatDiv.id);
		$('#'+chatDiv.id).focus();
	}
}
	
function addPrivateMessage(divId,from,text){

	var li = document.createElement('li');
	li.className = 'message';
	li.innerHTML = '<b>' + from + '</b> : ' + text;
	document.getElementById(divId+'-messages').appendChild(li);

}


function formSubmit(divId){
	var div = document.getElementById(divId);
	var input = document.getElementById(divId+'-input');	
	addPrivateMessage(divId,'me',input.value);
	socket.emit('private-chat',input.value,div.getAttribute('data-to'));
	
	// reset the input
	input.value = '';
	input.focus();
	return false;
}
