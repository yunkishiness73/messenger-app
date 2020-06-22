function sendConversationsList(conversations) {
   socket.emit('join-in-conversations', {
        conversations
   });
}

function emitNewPrivateMessage(message) {
    socket.emit('private-message', {
        message
    });
}

socket.on('new-messages', message => {
    //Reload conversation to get newest message
    fetchConversations();
                
    appendToMessageList(message);
});

socket.on('socketID', payload => {
    console.log(payload);
});
