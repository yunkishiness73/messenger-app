let API_URL = 'http://localhost:1337/api/users/me/conversations';
const BASE_URL = 'http://localhost:1337';

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
        imgURL = 'https://www.clipartmax.com/png/middle/51-515668_download-icon-group-chat-icon-png.png';
        conversation['conversationName'] = conversationName;
    } else if (conversation.type === 'Single') {
        if (conversation.members[0]._id === userInfo._id) {
            conversationName = conversation.members[1].displayName || '';
            imgURL = `${BASE_URL}/${conversation.members[0].photo}`.replace('uploads', '') || '';
            conversation['to'] = conversation.members[1]; 
            conversation['conversationName'] = conversationName;
        } else {
            conversationName = conversation.members[0].displayName || '';
            imgURL = `${BASE_URL}/${conversation.members[1].photo}`.replace('uploads', '') || '';
            conversation['to'] = conversation.members[0];
            conversation['conversationName'] = conversationName;
        }
    }

    return `
        <a data-conversation='${JSON.stringify(conversation)}' href="#" class="room-chat" data-conversation-id="${conversation._id}">
            <li class="person" data-chat="${conversation._id}">
                <div class="left-avatar">
                    <div class="dot"></div>
                    <img src="${imgURL}" alt="">
                </div>
                <span class="name">
                    ${conversationName}
                </span>
                <span class="time">
                    ${moment(conversation.updatedAt).locale("vi").startOf("seconds").fromNow()}
                </span>
                <span class="preview convert-emoji">
                   ${ conversation.lastMessage ? conversation.lastMessage.message : ''}
                </span>
            </li>
        </a>`;
}

function handleConversationClick() {
    $('body').on('click', '.room-chat', function(e) {
        e.preventDefault();

        let conversationID = $(this).attr("data-conversation-id");
        let conversation = $(this).attr("data-conversation");

        fetchConversationMessage(conversationID);
        
        console.log($(this).data('conversation')._id);
        console.log(conversation._id);
        console.log(JSON.parse(conversation));
        showConversationInfo(JSON.parse(conversation));
    })
}

function showConversationInfo(conversation) {
   $("[data-chat='']").attr("data-chat", conversation._id);
   console.log(conversation.conversationName);
   $('.conversation-name').html(conversation.conversationName);
}

function fetchConversations() {
    errorHandler.checkTokenExisted();

    $.ajax({
        type: "GET",
        url: `${API_URL}`,
        headers: {
            'Authorization': `Bearer ${baseService.token}`,
            'Content-Type': 'application/json'
        },
        dataType: "JSON",
        success: function (data, textStatus, xhr) {
            if (xhr.status === 200) {

                console.log(data);
                let conversations = renderConversation(data['data']);

                $('.people').html('');
                $('.people').append(conversations);
            }
        },
        error: errorHandler.onError
    })

}

function fetchConversationMessage(conversationID) {
    errorHandler.checkTokenExisted();

    $.ajax({
        type: "GET",
        url: `api/conversations/${conversationID}/messages?pageIndex=1&pageSize=30`,
        headers: {
            'Authorization': `Bearer ${baseService.token}`,
            'Content-Type': 'application/json'
        },
        dataType: "JSON",
        success: function (data, textStatus, xhr) {
            if (xhr.status === 200) {
                let messages = renderMessage(data['data']);
                $('.chat').html('');
                $('.chat').append(messages);
            }
        },
        error: errorHandler.onError
    })

}

function renderMessage(messages) {
    let messageList = ``;

    messages.forEach(message => {
        messageList += Message(message);
    });

    return messageList;
}

function Message(message) {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let creator = '';

    if (message.senderID._id === userInfo._id) {
        creator = 'me';
    } else {
        creator = 'you';
    }

    if (message.type === "Text") {
        return `<div class="convert-emoji bubble ${creator}" data-mess-id="${message._id}">
             ${message.message}
        </div>`;
    }

    if (message.type === "Image" || message.type === "Video") {
        return `<div class="bubble bubble-image-file ${creator}" data-mess-id="${message._id}">
            <img src="${BASE_URL}/${message.attachment.fileName}" class="show-image-chat" />
        </div>`;
    }

    if (message.type === "Others") {
        return `<div class="bubble bubble-attachment-file ${creator}" data-mess-id="${message._id}">
            <a href="${BASE_URL}/${message.attachment.fileName}" download="${message.attachment.fileName}">
                ${message.attachment.fileName}
            </a>
        </div>`;
    }

    if (message.type === "Notif") {
        return `<div class="bubble  bubble-attachment-file" data-mess-id="${message._id}">
            ${message.message}
        </div>`;
    }
}

$(function () {
    fetchConversations();

    handleConversationClick();
});