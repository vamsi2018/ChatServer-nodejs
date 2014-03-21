window.onload = function(){
	var socket = io.connect();
	socket.on('connect',function(){
		// Send a join event with your name
		socket.emit('join',prompt('What is your nickname'));
		// show the chat
		document.getElementById('chat').style.display = 'block';
	});
}
