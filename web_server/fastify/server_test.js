// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })

// Declare a route
// fastify.get('/', async (request, reply) => {
//   reply.type('application/json').code(200)
//   return { hello: 'world' }
// })

// 静的ファイルとしてレスポンス
fastify.register(require('@fastify/static'), {
    root: `${__dirname}/build`,
    prefix: '/'
  });
  
  
  // admin/* でリクエストが来たときは public/admin/index.html を返す
  fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/')) {
      reply.sendFile('index.html', `${__dirname}/build`);
    } else {
      reply.code(404).send('Not Found');
    }
  });



// 参考：https://qiita.com/ksh-fthr/items/2daaaf3a15c4c11956e9

// const axiosBase = require('axios');
// const axios = axiosBase.create({
//   baseURL: 'http://webmeeting:8080', // バックエンドB のURL:port を指定する
//   headers: {
//     'Content-Type': 'application/json',
//     'X-Requested-With': 'XMLHttpRequest'
//   },
//   responseType: 'json'  
// });
const axios = require('axios');


  fastify.get(
    "/chime-integration/meeting-session",
    async (request, reply) => {
      try {
        const params = new URLSearchParams([["room", request.query.room]]);
        const meetingSessionResponse = await axios.get(
          "/chime-integration/meeting-session",
          {
            params,
          }
        );
        return meetingSessionResponse;
      } catch(error) {
        console.error(error);
        return null;
      }
    }
  );


  fastify.get(
    "/chime-integration/messaging-session/:meetingId",
    async (request, reply) => {
      try {
        const params = new URLSearchParams([["room", request.query.room]]);
        const messagingSessionResponse = await axios.get(
          `/chime-integration/messaging-session/${request.params.meetingId}`,
          {
            params,
          }
        );
        return messagingSessionResponse;
      } catch(error) {
        console.error(error);
        return null;
      }
    }
  );


  fastify.post("/chime-integration/message", async (request, reply) => {
    const { channelMembership, content } = request.body;
    try {
      const sendMessage = await axios.post("/chime-integration/message", {
        channelMembership,
        content,
      });
      return sendMessage;
    } catch(error) {
      console.error(error);
      return null;
    }
  });



  // fastify.get(
  //   "/test",
  //   async (request, reply) => {
  //     try {
  //       const aaa = "Error Ejiri"
  //       const message = await axios.get("/test",{});
  //       //return request.query.room;
  //       return message;
  //     } catch(error) {
  //       if (aaa!=null) {
  //         return aaa; 
  //       } else {
  //         console.error(error);
  //         return "error return";
  //       }
  //     }     
  //   }
  // // );
  fastify.get(
    "/test",
     async (request, reply) => {
        //return request.query.room;
        // let message = "not Kenji";
        let message = await axios.get("http://webmeeting:80/test2",{});
        return message;
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

// fastify.listen({ port: 80 }, (err, address) => {
//   if (err) throw err
//   // Server is now listening on ${address}
// })