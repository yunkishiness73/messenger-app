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

        fetchConversationMessage({conversationID});
        
        console.log($(this).data('conversation')._id);
        console.log(conversation._id);
        console.log(JSON.parse(conversation));
        showConversationInfo(JSON.parse(conversation));
    })
}

function showConversationInfo(conversation) {
   $("[data-chat]").attr("data-chat", conversation._id);
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
                let conversations = renderConversation(data['data']);

                $('.people').html('');
                $('.people').append(conversations);
            }
        },
        error: errorHandler.onError
    })

}

function fetchConversationMessage(payload) {
    errorHandler.checkTokenExisted();

    let conversationID = payload.conversationID;
    let pageIndex = payload.pageIndex || 1;
    let pageSize = payload.pageSize || 20;
    let type = payload.type || 'append';

    $.ajax({
        type: "GET",
        url: `api/conversations/${conversationID}/messages?pageIndex=${pageIndex}&pageSize=${pageSize}`,
        headers: {
            'Authorization': `Bearer ${baseService.token}`,
            'Content-Type': 'application/json'
        },
        dataType: "JSON",
        success: function (data, textStatus, xhr) {
            if (xhr.status === 200) {
                appendToMessageList(data['data'], type);
            }
        },
        error: errorHandler.onError
    })

}

function fetchOlderMessage() {
    $('.chat').scroll(function(e) {
        console.log('before: ' +  $('.chat').scrollTop())
        console.log('heihgt: ' +  $('.chat').height())
        console.log('scroll height: ' +  $('.chat').prop('scrollHeight'))
        if ($(".chat").scrollTop() < 10 && $(".content").scrollTop() >= 0) {
         

            const conversationID = $('.chat').attr('data-chat');
            let pageIndex = parseInt($('.pageIndex').html());
            
            $('.pageIndex').html(++pageIndex);
        
            fetchConversationMessage({
                conversationID,
                pageIndex,
                type: 'prepend'
            });    
        }
    });
}

function appendToMessageList(data, type = 'append') {
    if (Array.isArray(data)) {
        //Set content is empty
        if (data.length === 0) {
            $('.chat').scrollTop(20);
        } else {
            let messages = renderMessage(data);

            if (type === 'append') {
                $('.chat').html('');
                $('.chat').append(messages);
                $('.pageIndex').html(1);
                
                scrollToBottom();
            } else {
                $('.chat').prepend(messages);    
            }
        }
    } else {
        let messages = renderMessage(data);
        
        $('.chat').append(messages);
        $('.pageIndex').html(1);

        scrollToBottom();
    }
}

function renderMessage(messages) {
    let messageList = ``;

    if (Array.isArray(messages)) {
        messages.forEach(message => {
            messageList += Message(message);
        });

        return messageList;
    }

    return Message(messages);
}

function scrollToBottom() {
    $('.chat').scrollTop($('.chat').prop('scrollHeight'));
}

function Message(message) {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let creator = '';

    if (typeof message.senderID === 'object') {
        if (message.senderID._id === userInfo._id) {
            creator = 'me';
        } else {
            creator = 'you';
        }
    } else if (typeof message.senderID === 'string') {
        if (message.senderID === userInfo._id) {
            creator = 'me';
        } else {
            creator = 'you';
        }
    }
  
    if (message.type === "Text") {
        return `<div class="convert-emoji bubble ${creator}" data-mess-id="${message._id}">
             ${message.message}
        </div>`;
    }

    if (message.type === "Image") {
        return `<div class="bubble bubble-image-file ${creator}" data-mess-id="${message._id}">
            <img src="${BASE_URL}/${message.attachment.fileName}" class="show-image-chat" />
        </div>`;
    }

    if (message.type === "Notif") {
        return `<div class="notif" data-mess-id="${message._id}">
            ${message.message}
        </div>`;
    }

        return `<div class="bubble bubble-attachment-file ${creator}" data-mess-id="${message._id}">
            <a href="${BASE_URL}/${message.attachment.fileName}" download="${message.attachment.fileName}">
                ${message.attachment.fileName}
            </a>
        </div>`;
}

// function newMessage() {
//     errorHandler.checkTokenExisted();

//     $('.write-chat').keypress(function(e) {
//         if (e.keyCode == 13) {
//             alert('here')
//             let conversationID = $(this).attr('data-chat');
//             let message = $.trim($(this).val());
           
//             if (message) {
//                 $.ajax({
//                     type: "POST",
//                     url: `api/messages/send`,
//                     headers: {
//                         'Authorization': `Bearer ${baseService.token}`,
//                         'Content-Type': 'application/json'
//                     },
//                     data:  JSON.stringify({
//                         conversationID: conversationID,
//                         messageType: 'Text',
//                         message: message
//                     }),
//                     dataType: "json",
//                     success: function (data, textStatus, xhr) {
//                         if (xhr.status === 200 || xhr.status === 201) {
//                         //Reload conversation to get newest message
//                           fetchConversations();
                          
//                           $('.write-chat').val('');
//                           appendToMessageList(data['data']);
//                         }
//                     },
//                     error: errorHandler.onError
//                 })
//             }
//         }
//     })
// }

function handleImageUploadEvent() {
    $(".image-chat").on('change', function () {
        let conversationID = $(this).attr('data-chat');
        let file = $(this).prop('files')[0];

        if (file && file.type.match(/image/)) {
            let fd = new FormData();
            
            fd.append('conversationID', conversationID);
            fd.append('attachment', file);
            
            $.ajax({
                url: '/api/messages/send',
                method: 'POST',
                data: fd,
                processData: false,
                contentType: false,
                headers: {
                    'Authorization': `Bearer ${baseService.token}`
                },
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        fetchConversations();
                      
                        appendToMessageList(data['data']);
                    }
                },
                error: function (xhr, errorMessage) {
                    alert(errorMessage);
                }
            });
        } else {
            alert("Vui lòng chọn hình ảnh");
        }
    });
}

function handleFileUploadEvent() {
    $(".attachment-chat").on('change', function () {
        let conversationID = $(this).attr('data-chat');
        console.log($(this).prop('files')[0]);
    });
}

$(function () {
    scrollToBottom();

    fetchConversations();

    handleConversationClick();

    handleFileUploadEvent();

    handleImageUploadEvent();
    // newMessage();

    fetchOlderMessage();
});