
'use strict';
const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

// 確認用（後で消去）
//const credentials = new AWS.Credentials({accessKeyId: 'AKIAQS2QEYUHT6GV6CHA', secretAccessKey: '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'})
//AWS.config.credentials = credentials
// const config = new AWS.Config({ region:'ap-northeast-1'})
// AWS.config.config = config

//参考：https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-chime/classes/chime.html

module.exports = async function (fastify, opts) {

  fastify.get(
    "/chime-integration/create-meeting",
    async function (request, reply) {
  
      // Initialize Chime instance
      //const chime = new AWS.Chime({ region: 'us-east-1' });
      const chime = new AWS.Chime({ region: process.env.AWS_REGION });
      //chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');
  
      // Retrieve Meetings list
      const meetingsResult = await chime.listMeetings().promise();
  
      // Can find a Meeting with a specific “external id” (aka, “room”)?
      const foundMeeting = Array.from(meetingsResult.Meetings).find(
        (it) => it.ExternalMeetingId === request.query.room
      );
  
      if (!foundMeeting) {
        try {
           // create a new Meeting info.
           const createdMeetingResponse = await chime.createMeeting({
            ClientRequestToken: uuid(),
            //MediaRegion: 'ap-northeast-1',
            MediaRegion: process.env.AWS_REGION,
            ExternalMeetingId: request.query.room,
          }).promise();
  
          return createdMeetingResponse;
  
        } catch(error) {
          console.error(error);
          return "Creating the meeting failed!!";
        }
      } else {
        return "The meeting has been already created!!";
      }
    }
  );


  fastify.get(
    "http://localhost:80/chime-integration/fetch-meeting-session",
    async function (request, reply) {

      // Initialize Chime instance
      //const chime = new AWS.Chime({ region: 'us-east-1' });
      const chime = new AWS.Chime({ region: process.env.AWS_REGION });
      //chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');

      // Retrieve Meetings list
      const meetingsResult = await chime.listMeetings().promise();

      // Can find a Meeting with a specific “external id” (aka, “room”)?
      const foundMeeting = Array.from(meetingsResult.Meetings).find(
        (it) => it.ExternalMeetingId === request.query.room
      );

      if (!foundMeeting) {
        return "The meeting is not created!!";
      } else {
        const meetingResponse =  { Meeting: foundMeeting };
        try{

          const attendeeResponse = await chime
            .createAttendee({
              MeetingId: meetingResponse.Meeting.MeetingId,
              ExternalUserId: uuid(), // Link the attendee to an identity managed by your application.
            })
            .promise();

          const idAppInstanceUserResponse = await chime
            .createAppInstanceUser({
              AppInstanceArn: process.env.APP_INSTANCE_ARN,
              AppInstanceUserId: userUid,
              Name: uuid(), // A display name for the user
            })
            .promise();

          const appInstanceUserArn = idAppInstanceUserResponse.AppInstanceUserArn;

          // create chime endpoint
          const endpointResponse = await chime.getMessagingSessionEndpoint().promise();

          // find or create selected channel
          const meetingId = meetingResponse.Meeting.MeetingId;

          const findChannel = async () => {
            const listChannelsRequest = await chime.listChannels({
              AppInstanceArn: process.env.APP_INSTANCE_ARN,
            });
            listChannelsRequest.on("build", () => {
              listChannelsRequest.httpRequest.headers["x-amz-chime-bearer"] =
                appInstanceUserArn;
            });
            const existingChannelsResponse = await listChannelsRequest.promise();
            return existingChannelsResponse.Channels.find(
              (c) => c.Name === meetingId
            );
          }
    
          const createChannel = async () => {
            const msgChannelCreateRequest = chime.createChannel({
              AppInstanceArn: process.env.APP_INSTANCE_ARN,
              Metadata: JSON.stringify({ ChannelType: "PUBLIC_STANDARD" }),
              Name: meetingId,
              Mode: "UNRESTRICTED",
              Privacy: "PUBLIC",
              ChimeBearer: appInstanceUserArn,
            });
            msgChannelCreateRequest.on("build", () => {
              msgChannelCreateRequest.httpRequest.headers["x-amz-chime-bearer"] =
                appInstanceUserArn;
            });
            return await msgChannelCreateRequest.promise();
          }

          const msgChannelArn = ((await findChannel()) || (await createChannel())).ChannelArn;
  
          // combine channel and user identity
          const  createChannelMembership = async () => {
            const msgChannelMembershipRequest = chime.createChannelMembership({
              ChannelArn: msgChannelArn,
              MemberArn: appInstanceUserArn,
              Type: "DEFAULT",
            });
            msgChannelMembershipRequest.on("build", () => {
              msgChannelMembershipRequest.httpRequest.headers[
                "x-amz-chime-bearer"
              ] = appInstanceUserArn;
            });
            return await msgChannelMembershipRequest.promise();
          }
          const msgChannelMembershipResponse = await createChannelMembership();

          // Respond with these infos so the frontend can safely use it
          return {
            msgChannelArn,
            msgChannelMembershipResponse,
            endpointResponse,
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          };

        } catch(error) {
          console.error(error);
        }

      }
    }
  );















  
  fastify.get(
    '/chime-integration/meeting-session',
    async function (request, reply) {
console.log("10");
      // Initialize Chime instance
      //const chime = new AWS.Chime({ region: 'us-east-1' });
      const chime = new AWS.Chime({ region: process.env.AWS_REGION });
      //chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');

      // Retrieve Meetings list
      const meetingsResult = await chime.listMeetings().promise();
      console.log("18");
      // Can find a Meeting with a specific “external id” (aka, “room”)?
      const foundMeeting = Array.from(meetingsResult.Meetings).find(
        (it) => it.ExternalMeetingId === request.query.room
      );
      console.log("23");
      // If not, create a new Meeting info.
      const createdMeetingResponse =
        !foundMeeting &&
        (await chime
          .createMeeting({
            ClientRequestToken: uuid(),
            //MediaRegion: 'ap-northeast-1',
            MediaRegion: process.env.AWS_REGION,
            ExternalMeetingId: request.query.room,
          })
          .promise());
          console.log("35");
      // … or use the found meeting data.
      const meetingResponse = foundMeeting
        ? { Meeting: foundMeeting }
        : createdMeetingResponse;
        console.log("40");
      // Create Attendee info using the existing Meeting info.
      const userUid = uuid();
      const attendeeResponse = await chime
        .createAttendee({
          MeetingId: meetingResponse.Meeting.MeetingId,
          ExternalUserId: userUid, // Link the attendee to an identity managed by your application.
        })
        .promise();
        console.log("49");
      // Respond with these infos so the frontend can safely use it
      return {
        attendeeResponse,
        meetingResponse,
      };
    }
  );

  fastify.get(
    "/chime-integration/messaging-session/:meetingId",
    async function (request, reply) {
      // initialize chime instance
      const chime = new AWS.Chime({ region: process.env.AWS_REGION });

      // create user identity
      const userUid = uuid();
      const idAppInstanceUserResponse = await chime
        .createAppInstanceUser({
          AppInstanceArn: process.env.APP_INSTANCE_ARN,
          AppInstanceUserId: userUid,
          Name: userUid, // A display name for the user
        })
        .promise();
      const appInstanceUserArn = idAppInstanceUserResponse.AppInstanceUserArn;

      // create chime endpoint
      const endpointResponse = await chime
        .getMessagingSessionEndpoint()
        .promise();

      // find or create selected channel
      const { meetingId } = request.params;

      async function findChannel() {
        const listChannelsRequest = await chime.listChannels({
          AppInstanceArn: process.env.APP_INSTANCE_ARN,
        });
        listChannelsRequest.on("build", () => {
          listChannelsRequest.httpRequest.headers["x-amz-chime-bearer"] =
            appInstanceUserArn;
        });
        const existingChannelsResponse = await listChannelsRequest.promise();
        return existingChannelsResponse.Channels.find(
          (c) => c.Name === meetingId
        );
      }

      async function createChannel() {
        const msgChannelCreateRequest = chime.createChannel({
          AppInstanceArn: process.env.APP_INSTANCE_ARN,
          Metadata: JSON.stringify({ ChannelType: "PUBLIC_STANDARD" }),
          Name: meetingId,
          Mode: "UNRESTRICTED",
          Privacy: "PUBLIC",
          ChimeBearer: appInstanceUserArn,
        });
        msgChannelCreateRequest.on("build", () => {
          msgChannelCreateRequest.httpRequest.headers["x-amz-chime-bearer"] =
            appInstanceUserArn;
        });
        return await msgChannelCreateRequest.promise();
      }

      const msgChannelArn = ((await findChannel()) || (await createChannel()))
        .ChannelArn;

      // combine channel and user identity
      async function createChannelMembership() {
        const msgChannelMembershipRequest = chime.createChannelMembership({
          ChannelArn: msgChannelArn,
          MemberArn: appInstanceUserArn,
          Type: "DEFAULT",
        });
        msgChannelMembershipRequest.on("build", () => {
          msgChannelMembershipRequest.httpRequest.headers[
            "x-amz-chime-bearer"
          ] = appInstanceUserArn;
        });
        return await msgChannelMembershipRequest.promise();
      }
      const msgChannelMembershipResponse = await createChannelMembership();

      // Respond with these infos so the frontend can safely use it
      return {
        msgChannelArn,
        msgChannelMembershipResponse,
        endpointResponse,
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }
  );

  fastify.post("/chime-integration/message", async function (request, reply) {
    const { channelMembership, content } = request.body;

    const chime = new AWS.Chime({ region: process.env.AWS_REGION });

    const channelMesssageRequest = chime.sendChannelMessage({
      ChannelArn: channelMembership.ChannelArn,
      Content: content,
      Persistence: "NON_PERSISTENT",
      Type: "STANDARD",
    });
    channelMesssageRequest.on("build", () => {
      channelMesssageRequest.httpRequest.headers["x-amz-chime-bearer"] =
        channelMembership.Member.Arn;
    });
    const channelMesssageRresponse = await channelMesssageRequest.promise();

    const sentMessage = {
      response: channelMesssageRresponse,
      CreatedTimestamp: new Date(),
      Sender: { Arn: channelMembership.Member.Arn, Name: channelMembership },
    };
    return sentMessage;
  });
};