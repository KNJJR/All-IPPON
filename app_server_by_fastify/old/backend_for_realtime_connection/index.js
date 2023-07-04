//　参考：https://qiita.com/yonetty/items/acc46afa59da1796a767

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('A client connected.');
    socket.on('send', (payload) => {
        console.log(payload);
        socket.broadcast.emit('broadcast', payload);
    });
    socket.on('disconnect', () => {
        console.log('Conenction closed.');
    });
});

server.listen(3002, () => {
    console.log('Listening..');
});