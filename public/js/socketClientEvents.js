function sendConversationsList(conversations) {
   socket.emit('join-in-conversations', {
        conversations
   });
}

function emitGroupChatCreation(conversation) {
    socket.emit('group-chat-creation', {
        conversation
    });
}

function listenGroupChatCreation() {
    socket.on('new-group-creation', conversation => {
        let currentConv = $('.right').attr('data-chat');

        if (currentConv && currentConv === conversation._id) {
            fetchConversations();

            fetchConversationMessage({ conversationID: conversation._id });
        }
    });
}

function emitNewPrivateMessage(message, members=[]) {
    socket.emit('private-message', {
        message,
        members
    });
}

function emitAcceptFriendRequest(users) {
    socket.emit('accept-friend-request', {
        users
    });
}

function emitRemoveUserEvent(payload) {
    socket.emit('notify-to-removed-user', payload);
}

function emitTypingEvent(payload) {
    socket.emit('user-typing', payload);
}

function emitStopTypingEvent(payload) {
    socket.emit('user-stop-typing', payload);
}

socket.on('user-typing', payload => {
    console.log(payload);
    showUsersTyping(payload['userTyping'], payload['conversationID']);
});

socket.on('user-stop-typing', payload => {
    console.log(payload);
    hideUsersTyping(payload['userTyping']);
});

socket.on('new-messages', message => {
    //Reload conversation to get newest message
    fetchConversations();

    let currentConv = $('.right').attr('data-chat');

    if (currentConv && currentConv === message.conversation) {
        appendToMessageList(message);
    }
});

socket.on('socketID', payload => {
    console.log(payload);
});

socket.on('new-group-creation', conversation => {
    let currentConv = $('.right').attr('data-chat');

    if (currentConv && currentConv === conversation._id) {
       refetchConversations().then(() => {
            beforeFetchConversationMessage(conversation);
        })
        .catch(err => {
            alertify.notify(err, 'error', 7);
        })
    } else {
        fetchConversations();
    }
});

socket.on('removed-user-event', payload => {
    let currentConv = $('.right').attr('data-chat');

    if (currentConv && currentConv === payload.conversationID) {
        $('#screen-chat').hide();
        fetchConversations();
    } else {
        fetchConversations();
    }
})

socket.on('notify-accept-friend-request', payload => {
    fetchFriendsList();

    fetchFriendsRequest();

    fetchImcommingRequest();
})
