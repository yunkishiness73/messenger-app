module.exports = (io) => {
    io.on('connection', socket => {
        console.log('New connection ' +socket.id);
        socket.emit('socketID', { socketID: socket.id });

        socket.on('send-friends-list', payload => {
            socket.friends = payload.friends;
        });

        socket.on('notifyUserIsActive', payload => {
            console.log(payload);
        });

        socket.on('join-in-conversations', payload => {
            payload.conversations = payload.conversations.split('');
            payload.conversations.forEach(conversation => {
                socket.join(conversation);
            });
        });

        socket.on('private-message', payload => {
            io.to(payload.conversationID).emit('new-messages', payload.message);
        });

        socket.on('send-friend-request', payload => {
            let data = {
                message: 'New incomming request'
            };
            io.to(payload.socketID).emit('new-incomming-request', data);
        });

        socket.on('accept-friend-request', payload => {
            let data = {
                message: 'Accepted your friend request'
            };
            io.to(payload.socketID).emit('notify-accept-friend-request', data);
        });

        socket.on("user-typing", payload => {
            let data = {
                message: `${socket.id} is typing`
            };
            socket.to(payload.conversationID).emit('user-typing', data);
        });
    
        socket.on("user-stop-typing", payload => {
            let data = {
                message: `${socket.id} stop typing`
            };
            socket.to(payload.conversationID).emit('user-stop-typing', data);
        });

        socket.on('disconnect', (reason) => {
            console.log(`${socket.id} is disconnected`);
            // socket.emit('socketDisconnected', { socketID: socket.id });
            // socket.friends.forEach(friend => {
            //     io.to(friend).emit('user-disconnected');
            // })
        });
    });
}