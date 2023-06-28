const fastify = require('fastify')({
  logger: true
})

fastify.get("/chime-integration/meeting-session", async (request, reply) => {
  const params = new URLSearchParams([["room", request.query.room]]);
  try {
     const meetingSessionResponse = await axios.get(
      "http://webmeeting:8080/chime-integration/meeting-session",
      {
        params,
      }
    );
    reply.type('application/json').code(200);
    return { result: meetingSessionResponse }
  } catch (error) {
    console.error(error);
    // 検討事項：リトライ処理、運用者へのエラー通知、ユーザーへのエラー通知
    reply.type('application/json').code(400);
    return { error: error }
  }
})

fastify.listen({ port: 80 }, (err, address) => {
  if (err) throw err
  // Server is now listening on ${address}
})