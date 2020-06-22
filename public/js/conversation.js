let API_URL = 'http://localhost:1337/api/users/me/conversations';
const BASE_URL = 'http://localhost:1337';

function renderConversation(conversations) {
    let conversationList = ``;
    let conversationIDs = [];

    conversations.forEach(conversation => {
        conversationIDs.push(conversation._id);
        conversationList += Conversation(conversation);
    });

    console.log(conversationIDs);

    sendConversationsList(conversationIDs);

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

        console.log($(this).children());

        //Show chat screen
        $('#screen-chat').show();

        // nineScrollRight();

        let conversationID = $(this).attr("data-conversation-id");
        let conversation = $(this).attr("data-conversation");

        fetchConversationMessage({conversationID});
        
        console.log($(this).data('conversation')._id);
        console.log(conversation._id);
        console.log(JSON.parse(conversation));
        showConversationInfo(JSON.parse(conversation));

        configAttachmentsModal($(this).data('conversation')._id);
    })
}

function configAttachmentsModal(conversationID) {
    //Config image modal
    $('.imagesModal').attr('id', `imagesModal_${conversationID}`);
    $('.show-images').attr('href', `#imagesModal_${conversationID}`);

    //Config files modal
    $('.attachmentsModal').attr('id', `attachmentsModal_${conversationID}`);
    $('.show-attachments').attr('href', `#attachmentsModal_${conversationID}`);
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
                console.log(data['data']);
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
        if ($(".chat").scrollTop() <= 30) {
            $('.pageIndex').css('display', 'block');
        } else {
            $('.pageIndex').css('display', 'none');
        }
    });

    $('body').on('click', '.pageIndex', function(e) {
        const conversationID = $('.chat').attr('data-chat');
        let pageIndex = parseInt($('.pageIndex').attr('data-currentPage'));
        let hasMessage = parseInt($('.pageIndex').attr('data-hasMessage'));
        
        if (hasMessage) {
            $('.pageIndex').attr('data-currentPage', ++pageIndex);
    
            fetchConversationMessage({
                conversationID,
                pageIndex,
                type: 'prepend'
            });    
        } else {
            alertify.notify('No messages found', 'error', 7);
        }
    })
}

function appendToMessageList(data, type = 'append') {
    if (Array.isArray(data)) {
        //Set content is empty
        if (data.length === 0) {
            $('.pageIndex').attr('data-hasMessage', 0);   
        } else {
            let { msgs, imgs, files } = renderMessage(data);

            if (type === 'append') {
                $('.chat').html('');
                $('.chat').append(msgs);

                $('.all-images').html('');
                $('.all-images').append(imgs);

                $('.list-attachments').html('');
                $('.list-attachments').append(files);

                $('.pageIndex').attr('data-currentPage', 1);
                $('.pageIndex').hide();
                
                scrollToBottom();
            } else {
                $('.chat').prepend(msgs);
                $('.all-images').prepend(imgs);
                $('.list-attachments').prepend(files);

                $('.chat').scrollTop(Math.round($('.chat').prop('scrollHeight')/3)); 
            }
        }
    } else {
        let { message, img, file } = renderMessage(data);
        
        $('.chat').append(message);
        $('.all-images').append(img);
        $('.list-attachments').append(file);


        $('.pageIndex').attr('data-currentPage', 1);
        $('.pageIndex').attr('data-hasMessage', 1);

        scrollToBottom();
    }
}

function classifyMessage(msg) {
    let img = '', file = '', message = '';

    if (msg.type === "Image") {
        img = `<img src="${BASE_URL}/${msg.attachment.fileName}" alt="">`;
    }

    if (msg.type === "Video" || msg.type === "Others") {
         file = (`<li>
                    <a href="${BASE_URL}/${msg.attachment.fileName}" download="${msg.attachment.fileName}">
                        ${msg.attachment.fileName}
                    </a>
                </li>`);
    }

    message = Message(msg);

    return { img, file, message };
}

function renderMessage(messages) {
    let messageList = '';
    let imgs = '';
    let files = '';

    if (Array.isArray(messages)) {
        messages.forEach(message => {
           let classifiedMsg= classifyMessage(message);

           console.log( classifyMessage(message));

           imgs += classifiedMsg['img'];
           files += classifiedMsg['file'];
           messageList += classifiedMsg['message'];
        });

        return { msgs: messageList, imgs, files };
    }
    
    return classifyMessage(messages);
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

function handleFileUploadEvent() {
    $(".attachment-chat").on('change', function () {
        let maxSize = 10*1000*1000;
        let conversationID = $(this).attr('data-chat');
        let file = $(this).prop('files')[0];

        if (file.size > maxSize) {
            alertify.notify('Image must less than 10MB', 'error', 7);
            return false;
        } else {
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
                        emitNewPrivateMessage(data['data']);
                    }
                },
                error: function (xhr, errorMessage) {
                    alert(errorMessage);
                }
            });
        }    
     });
}

$(function () {
    scrollToBottom();
    
    fetchConversations();

    handleConversationClick();

    handleFileUploadEvent();

    fetchOlderMessage();
});