'use strict'

const express = require('express')
const graphqlHttp = require('express-graphql')
const { 
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType
} = require('graphql');

const { getVideoById, getVideos, createVideo } = require('./src/data');

const PORT = process.env.PORT || 3002;
const server = express();

const videoType = new GraphQLObjectType({
  name: 'Video',
  description: 'A video on Egghead.io',
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
    watched: {
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

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

server.use('/graphql', graphqlHttp({
  schema,
  graphiql: true,
}));

server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});