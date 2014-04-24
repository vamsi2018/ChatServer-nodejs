/*$(function() {
	$( "#CreateGroupDialog" ).dialog({
		autoOpen: true,
		show: {
			effect: "blind",
			duration: 1000
		},
		hide: {
			effect: "explode",
			duration: 1000
		}
	});
	$( "#opener" ).click(function() {
		$( "#dialog" ).dialog( "open" );
	});
});
*/

function getNickNames(){
	var rosterDiv = document.getElementById("rosterDiv");

	var activeConnectionsArray = rosterDiv.getElementsByClassName("activeConnectionClass");
	var nickNamesArray = [];
	for(var nickNameIndex = 0 ; nickNameIndex<activeConnectionsArray.length;nickNameIndex++){
		var nickNameDiv = activeConnectionsArray[nickNameIndex];
		var nickName = nickNameDiv.getElementsByTagName("label")[0].textContent;
		nickNamesArray.push(nickName);
	}
	return nickNamesArray;
}

function createNickNameDivForGroupChat(nickName){
	var div = document.createElement('div');
	div.className = 'nickNameDivSelect';
	var label = document.createElement('label');
	var inputCheckBox = document.createElement('input');
	inputCheckBox.type = 'checkbox';
	inputCheckBox.name = 'selectedContactsForGroupChat';
	inputCheckBox.value = nickName;
	label.appendChild(inputCheckBox);
	var spanNickName = document.createElement('span');
	spanNickName.textContent = nickName;
	label.appendChild(spanNickName);
	div.appendChild(label);
	return div;
}
function createGroupChat(){
	var createGroupDialog = document.getElementById('CreateGroupDialog');
	createGroupDialog.style.display='none';	
	var selectedContacts = $('#CreateGroupDialog input:checked').map(function(index,selectedCheckBox){return selectedCheckBox.value});
	var groupChatName = $('#groupChatNameInput').val();
	selectedContacts.push(nickname);
	socket.emit('createGroupChat',groupChatName,selectedContacts,nickname);
	$('#CreateGroupModal').modal('hide');
}
function createGroupChatDialog(){
	var createGroupDialog = document.getElementById('CreateGroupDialog');
	createGroupDialog.innerHTML="";
	createGroupDialog.style.display='block';	
	/*
	if(createGroupDialog.innerHTML == ""){
		
	}
	*/
	var nickNamesArray = getNickNames();
	var groupChatNameInput = document.createElement("input");
	groupChatNameInput.id='groupChatNameInput';
	groupChatNameInput.type = "text";
	groupChatNameInput.placeholder = 'Enter group chat name';

	var contactsDiv = document.createElement("div");
	for(var nickNameIndex=0;nickNameIndex<nickNamesArray.length;nickNameIndex++){
		var nickName = nickNamesArray[nickNameIndex];
		var nickNameDiv = createNickNameDivForGroupChat(nickName);
		contactsDiv.appendChild(nickNameDiv);
	}

	//var createGroupChatButton = document.createElement('input');
	//createGroupChatButton.type = 'button';
	//createGroupChatButton.setAttribute('onclick','createGroupChat()');
	//createGroupChatButton.value = 'Create Chat';
	createGroupDialog.appendChild(groupChatNameInput);
	createGroupDialog.appendChild(contactsDiv);
	//createGroupDialog.appendChild(createGroupChatButton);

	//$( "#CreateGroupDialog" ).dialog( "open" );
}
