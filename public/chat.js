//Used for matching smiley
var smiley = {};
smiley["o:\\)"]="&#x1F607";
smiley["O:\\)"]="&#x1F607";
smiley[">:-\\("]="&#x1F620";
smiley[">:\\("]="&#x1F623";
smiley[":'\\("]="&#x1F613";
smiley["3:\\)"]="&#x1F608";
smiley[":\\)"] = "&#x1F60C";
smiley[":\\("] = "&#x2639";
smiley[":P"]="&#x1F60B";
smiley[":p"]="&#x1F60B";
smiley[":D"]="&#x1F603";
smiley[":d"]="&#x1F603";
smiley[":\\*"]="&#x1F618";
smiley["8\\)"]="&#x1F60E";
smiley[":3"]="&#x1F616";
smiley["-_-"]="&#x1F610";
smiley[":o"]="&#x1F631";
smiley[":O"]="&#x1F631";
smiley[";\\)"]="&#x1F609";
//end of smileys
var others_name;

window.onload = function(){
	socket = io.connect();
	socket.on('connect',function(){

		// Send a join event with your name
		var nickname =prompt('What is your nickname');
		while(nickname == null || nickname == ""){
			var randNum=Math.floor(Math.random()*100);
			nickname = "Guest"+randNum;
		}
		socket.nickname = nickname.replace(/\ /g,'_');
		socket.emit('join',socket.nickname);
		document.getElementById('input').focus();
		var li = document.createElement('li');
		var nameDiv = document.createElement('a');
		nameDiv.innerHTML="Hi , "+nickname;
		li.appendChild(nameDiv);
		document.getElementsByClassName('nav pull-right')[0].appendChild(li);	
		// show the chat
		document.getElementById('chat').style.display = 'block';

		socket.on('announcement',function(msg){
			var li = document.createElement('li');
			li.className='announcement';
			li.innerHTML= msg;
			document.getElementById('messages').appendChild(li);
		});
		
		socket.on('userDisconnect',function(name){
			
			console.log("recieved userDisconnect");
			var rosterDiv = document.getElementById('rosterDiv');
			var disconnectedUserDiv = document.getElementById(name+'Conn');
			console.log("Removing "+name+"Conn");
			rosterDiv.removeChild(disconnectedUserDiv);
		});

		socket.on('alreadyRegistered',function(){
			document.body.innerHTML = 'You are already connected with this IP';
		});
	});



	function addMessage(from,text){
		var inputDiv = document.createElement('div');
		var flag = 0; // check to add the div or not
		inputDiv.className = 'message';
		for(var pattern in smiley ){
			var patt=new RegExp(pattern,'g');
			text = text.replace(patt,"<font size=4>"+smiley[pattern]+"</font>");
		}
		if(from == "me"){
			inputDiv.className= inputDiv.className+" floatLeft ";
			var len=document.getElementById('messages').getElementsByClassName('message').length -1;
			if(len >= 0){
				if(document.getElementById('messages').getElementsByClassName('message')[len].id != 'clouds' ){
					inputDiv.innerHTML = '<b>' + from + '</b> : ';
					inputDiv.id= 'clouds';
					inputDiv.innerHTML = inputDiv.innerHTML+ text;
				}
				else{
					flag = 1;
					document.getElementById('messages').getElementsByClassName('message')[len].innerHTML= document.getElementById('messages').getElementsByClassName('message')[len].innerHTML + '</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+ text;
				}
			}
		else{
			inputDiv.id= 'clouds';
			inputDiv.innerHTML = '<b>' + from + '</b> : ';
			inputDiv.innerHTML = inputDiv.innerHTML+ text;
			}	
		}
		else if(from == "Admin"){
			inputDiv.className= inputDiv.className+" floatRight";
			inputDiv.id = 'clouds-admin';
			//inputDiv.style.float='right';
			inputDiv.innerHTML = '<b>' + from + '</b>:'+text;
		}
		else{
			inputDiv.className= inputDiv.className+" floatRight";
			var len=document.getElementById('messages').getElementsByClassName('message').length -1;
			if(len >=0){
				if(document.getElementById('messages').getElementsByClassName('message')[len].id != 'clouds-others' ){
					inputDiv.innerHTML = '<b>' + from + '</b> : ';
					others_name=from;
					console.log("other name:"+others_name);
					inputDiv.id= 'clouds-others';
					inputDiv.innerHTML = inputDiv.innerHTML+ text;
				}
				else{
					flag = 1;
					if(others_name == from){
						document.getElementById('messages').getElementsByClassName('message')[len].innerHTML= document.getElementById('messages').getElementsByClassName('message')[len].innerHTML + '</br>'+ text;
					}
					else{
						others_name=from;
						document.getElementById('messages').getElementsByClassName('message')[len].innerHTML= document.getElementById('messages').getElementsByClassName('message')[len].innerHTML + '</br><b> '+from+'</b> :'+ text;
					}
				}
			}
		else{
			inputDiv.id= 'clouds-others';
			others_name=from;
			inputDiv.innerHTML = '<b>' + from + '</b> : ';
			inputDiv.innerHTML = inputDiv.innerHTML+ text;
			}
		}
		var br = document.createElement('br');
		if(flag != 1){
			document.getElementById('messages').appendChild(inputDiv);
		}
		document.getElementById('messages').appendChild(br);
	
		// Scroll the page so that inputDiv is in view
		//inputDiv.scrollIntoView();
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

function createClosableTabsInDiv(parentDivId,chatDiv,label){
	var id = chatDiv.id,
			tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";
	var li = tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) ,
			tabContentHtml = chatDiv.outerHTML;
	var tabs = $('#'+parentDivId).tabs();
	tabs.find( ".ui-tabs-nav" ).append( li );
	tabs.append(tabContentHtml);
	tabs.tabs( "refresh" );
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
		var closeSpan = "<span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span>";
		$('#chat').tabs().find(".ui-tabs-nav li:last").append(closeSpan);
		//createClosableTabsInDiv('chat',chatDiv,"Anonymous-Chat");
		//$('#chat').tabs('select','#'+chatDiv.id);
		//$('#'+chatDiv.id).focus();
	}else{
		// Check if the div is hidden
		document.querySelector('[href="#'+chatDiv.id+'"]').parentElement.style.display="block";
		document.querySelector('[href="#'+chatDiv.id+'"]').style.backgroundColor="green";
		// focus the already initiated chat div
		//$('#chat').tabs('select','#'+chatDiv.id);
		//$('#'+chatDiv.id).focus();
	}

}

function createChatDiv(name){
		//create the chat div here with input boxes and messages stuff
		var chatDiv = document.createElement('div');
		chatDiv.id = name+'ChatDiv';
		//chatDiv.class = "ui-tabs-panel ui-widget-content ui-corner-bottom";
		// Create the elements of this chat
		var messagesDiv = document.createElement('div');
		messagesDiv.id = chatDiv.id+'-messages';
		chatDiv.appendChild(messagesDiv);
		chatDiv.setAttribute('data-to',name);
		var form = document.createElement('form');
		form.id = chatDiv.id + '-form';
		var footerDiv = document.createElement('div');
		footerDiv.id='footer';
		var input = document.createElement('input');
		input.id = chatDiv.id + '-input';
		input.className = 'cloud';
		input.type='text';
		input.className = 'textInput';
		var sendButton = document.createElement('button');
		sendButton.id='button';
		sendButton.textContent='Send';
		footerDiv.appendChild(input);
		footerDiv.appendChild(sendButton);
		form.appendChild(footerDiv);
		chatDiv.appendChild(form);
		input.focus();
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
		var closeSpan = "<span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span>";
		$('#chat').tabs().find(".ui-tabs-nav li:last").append(closeSpan);
		$('#chat').tabs('select','#'+chatDiv.id);
		$('#'+chatDiv.id).focus();
	}else{
		// Check if the div is hidden
		document.querySelector('[href="#'+chatDiv.id+'"]').parentElement.style.display="block";
		document.querySelector('[href="#'+chatDiv.id+'"]').style.backgroundColor="green";
		// focus the already initiated chat div
		//$('#chat').tabs('select','#'+chatDiv.id);
		//$('#'+chatDiv.id).focus();
	}
}
	
function addPrivateMessage(divId,from,text){
	var inputDiv = document.createElement('div');
	var flag =0;
	inputDiv.className = 'message';
	for(var pattern in smiley ){
		var patt=new RegExp(pattern,'g');
		text = text.replace(patt,"<font size=4>"+smiley[pattern]+"</font>");
	}
	if(from == "me"){
			inputDiv.className= inputDiv.className+" floatLeft ";
			var len=document.getElementById(divId+'-messages').getElementsByClassName('message').length -1;
			if(len >= 0){
				if(document.getElementById(divId+'-messages').getElementsByClassName('message')[len].id != 'clouds' ){
					inputDiv.innerHTML = '<b>' + from + '</b> : ';
					inputDiv.id= 'clouds';
					inputDiv.innerHTML = inputDiv.innerHTML+ text;
				}
				else{
					flag = 1;
					document.getElementById(divId+'-messages').getElementsByClassName('message')[len].innerHTML= document.getElementById(divId+'-messages').getElementsByClassName('message')[len].innerHTML + '</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+ text;
				}
			}
		else{
			inputDiv.id= 'clouds';
			inputDiv.innerHTML = '<b>' + from + '</b> : ';
			inputDiv.innerHTML = inputDiv.innerHTML+ text;
			}	
		}
		else if(from == "Admin"){
			inputDiv.className= inputDiv.className+" floatRight";
			inputDiv.id = 'clouds-admin';
			//inputDiv.style.float='right';
			inputDiv.innerHTML = '<b>' + from + '</b>:'+text;
		}
		else{
			inputDiv.className= inputDiv.className+" floatRight";
			var len=document.getElementById(divId+'-messages').getElementsByClassName('message').length -1;
			if(len >=0){
				if(document.getElementById(divId+'-messages').getElementsByClassName('message')[len].id != 'clouds-others' ){
					inputDiv.innerHTML = '<b>' + from + '</b> : ';
					inputDiv.id= 'clouds-others';
					inputDiv.innerHTML = inputDiv.innerHTML+ text;
				}
				else{
					flag = 1;
					document.getElementById(divId+'-messages').getElementsByClassName('message')[len].innerHTML= document.getElementById(divId+'-messages').getElementsByClassName('message')[len].innerHTML + '</br>'+ text;
				}
			}
		else{
			inputDiv.id= 'clouds-others';
			inputDiv.innerHTML = '<b>' + from + '</b> : ';
			inputDiv.innerHTML = inputDiv.innerHTML+ text;
			}
		}
		if(flag != 1){
			document.getElementById(divId+'-messages').appendChild(inputDiv);
		}
		var br = document.createElement('br');
		document.getElementById(divId+'-messages').appendChild(br);
		//inputDiv.scrollIntoView();

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
	input.class='clouds-admin';
	
	addPrivateMessage(divId,'me',input.value);
	socket.emit('anonymousMessage',input.value,div.getAttribute("data-to"));
	
	// reset the input
	input.value = '';
	 document.getElementById(divId+'-input').focus();
	return false;
}

function chatAnonymously(){

	var messageBar = document.getElementById('messageBar');
	socket.emit('private-chat-anonymous',{});

}
