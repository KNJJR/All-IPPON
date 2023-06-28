// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })


  fastify.get(
    "/test2",
    (request, reply) => {
      return "OK Kenji";
    }
  );



// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 80, host: "0.0.0.0" })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()