module.exports = (io) => {
    io.on('connection', socket => {
        console.log('New connection ' +socket.id);
        socket.emit('socketID', { socketID: socket.id });

        socket.on('notifyUserIsActive', payload => {
            console.log(payload);
        });

        socket.on('disconnect', (reason) => {
            console.log(reason);
            console.log(`${socket.id} is disconnected`);
            socket.emit('socketDisconnected', { socketID: socket.id });
        });
    });
}