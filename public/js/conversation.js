const BASE_URL = 'http://localhost:1337/api/users/me/conversations';

function renderConversation(conversations) {
    let conversationList = ``;
	
	conversations.forEach(conversation => {
		conversationList += Conversation(conversation);
	  });

	 return conversationList;
}

function Conversation(conversation) {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let conversationName = '';
    let imgURL = '';

    if (conversation.type === 'Group') {
        conversationName = conversation.title;
        imgURL = '';
    } else if(conversation.type === 'Single') {
        if ( conversation.members[0]._id === userInfo._id) {
            conversationName = conversation.members[0].photo || '';
            imgURL = conversation.members[0].photo || ''; 
        } else {
            conversationName = conversation.members[1].photo || '';
            imgURL = conversation.members[1].photo || ''; 
        }
    }

    return `
        <a href="" class="room-chat" data-target="">
            <li class="person" data-chat="<%= conversation._id %>">
                <div class="left-avatar">
                    <div class="dot"></div>
                    <img src="${imgURL}" alt="">
                </div>
                <span class="name">
                    ${conversationName}
                </span>
                <span class="time">
                    ${conversation.updateAt}
                </span>
                <span class="preview convert-emoji">
                   ${ conversation.lastMessage ? conversation.lastMessage.message : '' }
                </span>
            </li>
        </a>`;
}

function fetchConversations() {
    errorHandler.checkTokenExisted();

    $.ajax({
        type: "GET",
        url: `${BASE_URL}`,
        headers: {
            'Authorization': `Bearer ${baseService.token}`,
            'Content-Type':'application/json'
        },
        dataType: "JSON",
        success: function(data, textStatus, xhr) {
            if (xhr.status === 200) {
            
                console.log(data);
                let conversations = renderConversation(data['data']);
                $('.people').append(conversations);
            }
        },
        error: errorHandler.onError
    })
    
}

$(function () {
    alert('loading');
    fetchConversations();
});