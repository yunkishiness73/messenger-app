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
        console.log('conversation in pm')   ;
        console.log(conversation);
            beforeFetchConversationMessage(conversation);
        })
        .catch(err => {
            alertify.notify(err, 'error', 7);
        })
    } else {
        fetchConversations();
    }
});

socket.on('notify-accept-friend-request', payload => {
    fetchFriendsList();

    fetchFriendsRequest();

    fetchImcommingRequest();
})
