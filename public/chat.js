window.onload = function(){
	socket = io.connect();
	socket.on('connect',function(){
		// Send a join event with your name
		socket.emit('join',prompt('What is your nickname'));
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
		
		});
	});

	function addMessage(from,text){
		var li = document.createElement('li');
		li.className = 'message';
		li.innerHTML = '<b>' + from + '</b> : ' + text;
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

	socket.on('requestedRoster',function(activeConnectionNames){
		var rosterDiv = document.getElementById('rosterDiv');
		rosterDiv.innerHTML = "";
		for(var index=0;index<activeConnectionNames.length;index++){
			var connDiv = document.createElement('div');
			connDiv.id = activeConnectionNames[index]+'Conn';
			connDiv.innerText = activeConnectionNames[index];
			rosterDiv.appendChild(connDiv);
		}
	});

}

function getRoster(){
	socket.emit('getRoster',"");
}
