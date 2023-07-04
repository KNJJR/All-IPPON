'use strict'

module.exports = async function (fastify, opts) {

    fastify.register(require("fastify-socket.io"));

    fastify.ready().then(() => {
        // we need to wait for the server to be ready, else `server.io` is undefined
        //参考：https://socket.io/docs/v4/namespaces/
        fastify.io.of("/manager").on('connection', (socket) => {
          console.log('A client connected.');
          socket.on('send', (payload) => {
              console.log(payload);
              socket.broadcast.emit('broadcast', payload);
          });
          socket.on('disconnect', () => {
              console.log('Conenction closed.');
          });
      });
      });





//     const http = require('http').createServer(fastify);

//     const fastifyIO = require("fastify-socket.io")(http, {
//         path: '', // 参考：https://www.appsloveworld.com/reactjs/100/40/websockets-proxy-using-socket-io-client-in-create-react-app
//     });

//   fastify.register(fastifyIO);

//   fastify.ready().then(() => {
//     // we need to wait for the server to be ready, else `server.io` is undefined
//     fastify.io.on('connection', (socket) => {
//       console.log('A client connected.');
//       socket.on('send', (payload) => {
//           console.log(payload);
//           socket.broadcast.emit('broadcast', payload);
//       });
//       socket.on('disconnect', () => {
//           console.log('Conenction closed.');
//       });
//   });
//   });


}