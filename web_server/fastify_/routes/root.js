'use strict'

module.exports = async function (fastify, opts) {

  fastify.get('/', async function (request, reply) {
    return { root: true }
  })

  fastify.get('/chime-integration/meeting-session', async function (request, reply) {
    try{
      const meetingSessionResponse = await axios.get(
        "http://localhost:80/chime-integration/meeting-session",
        {
          params,
        }
      );
    } catch(error) {
      console.error(error);
    }

    return meetingSessionResponse

  })


}
