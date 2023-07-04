'use strict'

const fastifyIO = require("fastify-socket.io");

module.exports = async function (fastify, opts) {

  fastify.register(fastifyIO);

  fastify.get('/', async function (request, reply) {
    //return { root: true }
    //fastify.io.emit("hello");
  })


  fastify.ready().then(() => {
    // we need to wait for the server to be ready, else `server.io` is undefined
    fastify.io.on('connection', (socket) => {
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


}