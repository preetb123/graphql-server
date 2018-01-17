'use strict'

const express = require('express')
const { 
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType,
  execute,
  subscribe,
} = require('graphql');

const { createServer } = require('http');
const bodyParser = require('body-parser');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { PubSub } = require('graphql-subscriptions');
const  {
  graphqlExpress,
  graphiqlExpress,
} = require('graphql-server-express');

const pubsub = new PubSub();

exports.pubsub = pubsub;

const { getVideoById, getVideos, createVideo } = require('./src/data');

const PORT = process.env.PORT || 3002;
const app = express();
const dev = process.env.NODE_ENV !== 'production';

const videoType = new GraphQLObjectType({
  name: 'Video',
  description: 'A video to be released',
  fields: {
    id: {
      type: GraphQLID,
      description: 'The id of the video', 
    },
    title: {
      type: GraphQLString,
      description: 'The title of the video'
    },
    duration: {
      type: GraphQLInt,
      description: 'The duration of the video(in seconds)'
    },
    released: {
      type: GraphQLBoolean,
      description: 'Whether the viewer watched the video'
    },
  },
})

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  description: 'The root query type',
  fields: {
    videos: {
      type: new GraphQLList(videoType),
      resolve: () => getVideos(),
    },
    video: {
      type: videoType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The id of the video'
        }
      },
      resolve: (_, args) => {
        return getVideoById(args.id);
      },
    }
  }
});

const videoInputType = new GraphQLInputObjectType({
  name: 'VideoInput',
  description: 'Input type for the video object',
  fields: {
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the video',
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The duration of the video in seconds'
    },
    released: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the video is released',
    },
  }
});

const mutationType = new GraphQLObjectType({
  name: 'MutationType',
  description: 'The root mutation type',
  fields: {
    createVideo: {
      type: videoType,
      args: {
        video: {
          type: new GraphQLNonNull(videoInputType),
        }
      },
      resolve: (_, args) => {
        return createVideo(args.video);
      }
    }
  }
});

const VIDEO_ADDED = 'VIDEO_ADDED';

const subscriptionType = new GraphQLObjectType ({
  name: 'SubscriptionType',
  description: 'The root subscription type',
  fields:{
    videoAdded: {
      type: videoType,
      subscribe: () => pubsub.asyncIterator(VIDEO_ADDED),
    }
  }
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
  subscription: subscriptionType,
});

app.use(bodyParser.json());

app.use('/graphql', graphqlExpress({
  schema
}));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
}))

const server = createServer(app);

server.listen(PORT, () => {
  new SubscriptionServer({
    schema,
    execute,
    subscribe,
    onConnect: () => console.log('client connected')
  }, {
    server,
    path: '/subscriptions'
  });
  console.log(`listening on http://localhost:${PORT}`);
});