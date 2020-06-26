module.exports = (io) => {
    io.on('connection', socket => {
        console.log('New connection ' +socket.id);
        socket.emit('socketID', { socketID: socket.id });

        socket.on('send-friends-list', payload => {
            socket.friends = payload.friends;
        });

        socket.on('getSocketID', () => {
            socket.emit('socketID', { socketID: socket.id });
        });

        socket.on('notifyUserIsActive', payload => {
            console.log(payload);
        });

        socket.on('group-chat-creation', payload => {
            let conversation = payload.conversation;

            console.log(conversation);

            conversation.members.forEach(m => {
                io.in(m).emit('new-group-creation', conversation);
            });
        });

        socket.on('join-in-conversations', payload => {
            const conversations = payload.conversations;

            conversations.forEach(conversation => {
                socket.join(conversation);
            });
        });

        socket.on('private-message', payload => {
            //socket.adapter.rooms

            const members = payload.members;

            if (members.length > 0) {
                members.forEach(m => {
                    io.in(m).emit('new-messages', payload.message);
                })
            } else {
                io.in(payload.message.conversation).emit('new-messages', payload.message);
            }
        });

        /* SOCKET FOR FRIEND REQUEST */
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

            payload.users.forEach(m => {
                io.in(m).emit('notify-accept-friend-request', data);
            });
        });

        /* SOCKET FOR TYPING EVENT */
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