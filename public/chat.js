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
		var inputDiv = document.createElement('div');
		inputDiv.className = 'message';
		inputDiv.innerHTML = '<b>' + from + '</b> : ';
		if(from == "me"){
			inputDiv.className= inputDiv.className+" floatLeft";
			//inputDiv.style.float='left';
			inputDiv.innerHTML = inputDiv.innerHTML+ text;
		}
		else{
			inputDiv.className= inputDiv.className+" floatRight";
			//inputDiv.style.float='right';
			inputDiv.innerHTML =inputDiv.innerHTML+ text;
		}
		var br = document.createElement('br');
		document.getElementById('messages').appendChild(inputDiv);
		document.getElementById('messages').appendChild(br);
		
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

	socket.on('anonymousMessage',function(msg,id,type){
		initiateAnonymousChat(id);
		var toDiv = document.getElementById(id+"ChatDiv");
		var toName= "";
		if(type==1){
			toName = "Admin";
		}else{
			toName = "Anonymous";
		}
		addPrivateMessage(toDiv.id,toName,msg);
	});
}

function getRoster(){
	socket.emit('getRoster',"");
}

function initiateAnonymousChat(id){
	var chatDiv = document.getElementById(id+'ChatDiv');
	if(chatDiv === null){
		chatDiv = createChatDiv(id);
		chatDiv.getElementsByTagName("form")[0].onsubmit=function(){
			formSubmitAnonymously(chatDiv.id);
			return false;
		};

		var chat = document.getElementById('chat');
		chat.appendChild(chatDiv);
		$('#chat').tabs('add','#'+chatDiv.id,"Anonymous-Chat");
		$('#chat').tabs('select','#'+chatDiv.id);
		$('#'+chatDiv.id).focus();
	}else{
		// focus the already initiated chat div
		$('#chat').tabs('select','#'+chatDiv.id);
		$('#'+chatDiv.id).focus();
	}

}

function createChatDiv(name){
		//create the chat div here with input boxes and messages stuff
		var chatDiv = document.createElement('div');
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
		var sendButton = document.createElement('button');
		sendButton.innerText='Send';
		footerDiv.appendChild(input);
		footerDiv.appendChild(sendButton);
		form.appendChild(footerDiv);
		chatDiv.appendChild(form);
		
		return chatDiv;
}
function initiateChatWith(name){
	var chatDiv = document.getElementById(name+'ChatDiv');
	if(chatDiv === null){
		chatDiv = createChatDiv(name);
		chatDiv.getElementsByTagName("form")[0].onsubmit=function(){
			formSubmit(chatDiv.id);
			return false;
		};

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

	var inputDiv = document.createElement('div');
	inputDiv.className = 'message';
	if(from == "me"){
			inputDiv.className= inputDiv.className+" floatLeft";
			//inputDiv.style.float='left';
			inputDiv.innerHTML = '<b>' + from + '</b> : ' + text;
		}
		else{
			inputDiv.className= inputDiv.className+" floatRight";
			//inputDiv.style.float='right';
			inputDiv.innerHTML = '<b>' + from + '</b>:'+text;
		}
	document.getElementById(divId+'-messages').appendChild(inputDiv);
	var br = document.createElement('br');
	document.getElementById(divId+'-messages').appendChild(br);

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
function formSubmitAnonymously(divId){
	var div = document.getElementById(divId);
	var input = document.getElementById(divId+'-input');	
	addPrivateMessage(divId,'me',input.value);
	socket.emit('anonymousMessage',input.value,div.getAttribute("data-to"));
	
	// reset the input
	input.value = '';
	input.focus();
	return false;
}

function chatAnonymously(){

	var messageBar = document.getElementById('messageBar');
	socket.emit('private-chat-anonymous',{});

}
