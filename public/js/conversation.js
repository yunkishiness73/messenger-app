let API_URL = 'http://localhost:1337/api/users/me/conversations';
const BASE_URL = 'http://localhost:1337';

function renderConversation(conversations) {
    let groupChats = '', userChats = '';
    let conversationList = ``;
    let conversationIDs = [];

    conversations.forEach(conversation => {
        if (conversation.type === 'Group') {
            groupChats += Conversation(conversation);
        } else if (conversation.type === 'Single') {
            userChats += Conversation(conversation);
        }

        conversationList += Conversation(conversation);

        conversationIDs.push(conversation._id);
    });

    sendConversationsList(conversationIDs);

    return {
        allChats: conversationList,
        groupChats: groupChats,
        userChats: userChats
    };
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
            imgURL = `${BASE_URL}/${conversation.members[1].photo}`.replace('uploads', '') || 'https://img.icons8.com/material/4ac144/256/user-male.png';
            conversation['to'] = conversation.members[1]; 
            conversation['conversationName'] = conversationName;
        } else {
            conversationName = conversation.members[0].displayName || '';
            imgURL = `${BASE_URL}/${conversation.members[0].photo}`.replace('uploads', '') || 'https://img.icons8.com/material/4ac144/256/user-male.png';
            conversation['to'] = conversation.members[0];
            conversation['conversationName'] = conversationName;
        }
    }

    let lastMessage = conversation.lastMessage ? conversation.lastMessage.message : '';

    let _conversation = _.cloneDeep(conversation);

    delete _conversation['lastMessage'];

    return `
        <a data-conversation='${JSON.stringify(_conversation)}' href="#" class="room-chat" data-conversation-id="${conversation._id}">
            <li hasSeen='${conversation.seenBy.indexOf(userInfo._id) === -1 ? 0 : 1 }' class="person ${conversation.seenBy.indexOf(userInfo._id) === -1 ? 'active' : ''}"  data-conversation-id="${conversation._id}">
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
                   ${ lastMessage }
                </span>
            </li>
        </a>`;
}

function handleConversationClick() {
    $('body').on('click', '.room-chat', function(e) {
        e.preventDefault();

        //Show chat screen
        $('#screen-chat').show();

        //Mark seen conversation

        // nineScrollRight();

        let conversationID = $(this).attr("data-conversation-id");
        let conversation = $(this).attr("data-conversation");

        markSeen(conversationID);


        beforeFetchConversationMessage(JSON.parse(conversation));

        // fetchConversationMessage({conversationID});
        
        // showConversationInfo(JSON.parse(conversation), conversation);

        // configAttachmentsModal($(this).data('conversation')._id);
    })
}

function beforeFetchConversationMessage(conversation) {
    showConversationInfo(conversation, JSON.stringify(conversation));

    configAttachmentsModal(conversation._id);

    fetchConversationMessage({conversationID: conversation._id });
}

function configAttachmentsModal(conversationID='') {
    //Config image modal
    $('.imagesModal').attr('id', `imagesModal_${conversationID}`);
    $('.show-images').attr('href', `#imagesModal_${conversationID}`);

    //Config files modal
    $('.attachmentsModal').attr('id', `attachmentsModal_${conversationID}`);
    $('.show-attachments').attr('href', `#attachmentsModal_${conversationID}`);
}

function showConversationInfo(conversation, originalEntity) {
   $("[data-chat]").attr("data-chat", conversation._id);
   $('.conversation-name').html(conversation.conversationName);

   $('.pageIndex').attr('data-hasMessage', 1);
   $('.pageIndex').attr('data-currentPage', 1);

   if (conversation.type === 'Group') {
        let currentConv = $(`.people>a[data-conversation-id=${conversation._id}]`).attr('data-conversation');

        $('.conversation-name').html('');
        $('.conversation-name').html(conversation.title);
        $('.show-member-tab').show();
        $('.show-number-members').html(conversation.members.length);
        $('.number-members').attr('data-conversation', currentConv);
        $('#btn-create-group-chat').attr('data-conversationID', conversation._id);
   } else if(conversation.type === 'Single') {
        $('.show-member-tab').hide();
   }
}

// function showGroupModal() {
//     $('.number-members').click(function (e) { 
//         let conversation = JSON.parse($(this).attr('data-conversation'));

//         $('#btn-create-group-chat').attr('data-conversationID', conversation._id);
//     });
// }

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
                let { allChats, groupChats, userChats } = renderConversation(data['data']);

                $('.people').html('');
                $('#all-chat > .people').append(allChats);
                $('#user-chat > .people').append(userChats);
                $('#group-chat > .people').append(groupChats);
            }
        },
        error: errorHandler.onError
    })

}

function refetchConversations() {
    return new Promise((resolve, reject) => {
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
                    let { allChats, groupChats, userChats } = renderConversation(data['data']);

                    $('.people').html('');
                    $('#all-chat > .people').append(allChats);
                    $('#user-chat > .people').append(userChats);
                    $('#group-chat > .people').append(groupChats);

                    resolve(data['data']);
                }
            },
            error: errorHandler.onError
        })
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
        
        if (hasMessage && conversationID) {
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
    let typing = `<div class="typing" style="display: none;">
                    <div class="bubble-image-file you" data-mess-id="">
                        <img src="https://img.icons8.com/material/4ac144/256/user-male.png" class="avatar-small" title="">
                        <img src="images/typing.gif" class="threedots" />
                    </div>
                </div>`;

    if (Array.isArray(data)) {
        //Set content is empty
        if (data.length === 0) {
            $('.pageIndex').attr('data-hasMessage', 0);   
        } else {
            let { msgs, imgs, files } = renderMessage(data);

            if (type === 'append') {
                $('.chat').html('');

                if (!$('.typing').length) {
                    $('.chat').html(typing);
                }

                //$('.chat').append(msgs);
                $(msgs).insertBefore($('.chat > .typing'));

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
        
        if (!$('.typing').length) {
            $('.chat').html(typing);
        }
        
        $(message).insertBefore($('.chat > .typing'));
        //$('.chat').append(message);
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

    let photo = '';

    if (message.senderID.photo) {
        photo = `${BASE_URL}/${message.senderID.photo}`.replace('uploads', '');
    } else {
        photo = 'https://img.icons8.com/material/4ac144/256/user-male.png';
    }

    if (message.type === "Text") {
        return `<div title="${moment(message.createdAt).format('hh:mm')}" class="convert-emoji bubble ${creator}" data-mess-id="${message._id}">
            <img src="${photo}" class="avatar-small" title="${message.senderID.displayName}">
            ${message.message}
        </div>`;
    }

    if (message.type === "Image") {
        return `<div title="${moment(message.createdAt).format('hh:mm')}" class="bubble bubble-image-file ${creator}" data-mess-id="${message._id}">
            <img src="${photo}" class="avatar-small" title="${message.senderID.displayName}">
            <img src="${BASE_URL}/${message.attachment.fileName}" class="show-image-chat" />
        </div>`;
    }

    if (message.type === "Notif") {
        return `<div class="notif" data-mess-id="${message._id}">
            ${message.message}
        </div>`;
    }

        return `<div title="${moment(message.createdAt).format('hh:mm')}" class="bubble bubble-attachment-file ${creator}" data-mess-id="${message._id}">
            <a href="${BASE_URL}/${message.attachment.fileName}" download="${message.attachment.fileName}">
                <img src="${photo}" class="avatar-small" title="${message.senderID.displayName}">
                ${message.attachment.fileName}
            </a>
        </div>`;
}

function removeUploadedFile() {
    $(".attachment-chat").val('');
}

function handleFileUploadEvent() {
    $(".attachment-chat").on('change', function () {
        let maxSize = 10*1000*1000;
        let conversationID = $(this).attr('data-chat');
        let file = $(this).prop('files')[0];

        let fd = new FormData();

        if (file.size > maxSize) {
            alertify.notify('File must less than 10MB', 'error', 7);
            return false;
        } else {
            if (conversationID) {
            
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
                            removeUploadedFile();

                            emitNewPrivateMessage(data['data']);
                        }
                    },
                    error: function (xhr, errorMessage) {
                        removeUploadedFile();
 
                        alert(errorMessage);
                    }
                });

            } else {
                let receiverID = $('.conversation-name').attr('data-receiverID');
                let currentUser = JSON.parse(localStorage.getItem('userInfo'));
                
                fd.append('receiverID', receiverID);
                fd.append('attachment', file);
                fd.append('conversationType', 'Single');
                
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
                            removeUploadedFile();
 
                            $("[data-chat]").attr("data-chat", data['data'].conversation);

                            emitNewPrivateMessage(data['data'], [receiverID, currentUser._id]);
                        }
                    },
                    error: function (xhr, errorMessage) {
                        removeUploadedFile();
 
                        alert(errorMessage);
                    }
                });
            }
        } 
     });
}

function markSeen(conversationID) {
    let convElement = $('li.person[data-conversation-id='+ conversationID +']');
    let hasSeen = parseInt(convElement.attr('hasSeen'));

    if (!hasSeen) {
      errorHandler.checkTokenExisted();

      $.ajax({
          type: "PUT",
          url: `api/conversations/${conversationID}/markSeen`,
          headers: {
              'Authorization': `Bearer ${baseService.token}`,
              'Content-Type': 'application/json'
          },
          dataType: "json",
          success: function (data, textStatus, xhr) {
              if (xhr.status === 200 || xhr.status === 201) {
                convElement.attr('hasSeen', 1);
                convElement.removeClass('active');
              }
          },
          error: errorHandler.onError
      })
    }
}

function changeTypeChat() {
    $("#select-type-chat").bind("change", function(){
        let optionSelected = $("option:selected", this);
        optionSelected.tab("show");

        if ($(this).val() === "user-chat") {
        $(".create-group-chat").hide();
        } else {
        $(".create-group-chat").show();
        }
    });
  }

  let usersTyping = [];

  function showUsersTyping(user) {
    usersTyping.push(user);


    usersList = renderUsersTyping(usersTyping);

    
    console.log(usersList)

    $('.typing').show();
    $('.typing').html('');
    $('.typing').append(usersList);
  }

  function hideUsersTyping(user) {
    console.log(usersTyping);
    console.log('---------');
    console.log(user);
    usersTyping = usersTyping.filter(userTyping => {
        return userTyping._id !== user._id;
    });

    usersList = renderUsersTyping(usersTyping);

    console.log('---------result');
    console.log(usersTyping);

    $('.typing').html('');
    $('.typing').append(usersList);
  }

  function renderUsersTyping(users) {
    let usersList = ``;

    users.forEach(user => {
        usersList += UserTyping(user);
    });

    return usersList;
  }

  function UserTyping(user) {
      let photo = '';

      if (user.photo) {
          photo = `${BASE_URL}/${user.photo}`.replace('uploads', '');
      } else {
          photo = 'https://img.icons8.com/material/4ac144/256/user-male.png';
      }

      return `<div class="bubble-image-file you" data-mess-id="">
                <img src="${photo}" class="avatar-small" title="${user.displayName}">
                <img src="images/typing.gif" class="threedots" />
            </div>`;
  }

$(function () {
    scrollToBottom();
    
    fetchConversations();

    handleConversationClick();

    handleFileUploadEvent();

    fetchOlderMessage();

    changeTypeChat();    
});