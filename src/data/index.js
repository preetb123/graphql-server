const { pubsub } = require('../../index')

const videoA = {
    id: 'fksdlkfjsdlf',
    title: 'This is first video added',
    duration: 240,
    released: false
};
  
const videoB = {
    id: 'lsdkfskdfkldsfdlskfkd',
    title: 'This is the second video',
    duration: 244,
    released: true
};
  
const videos = [videoA, videoB];
  
const getVideos = () => new Promise((resolve) => resolve(videos));

const createVideo = ({ title, duration, released }) => {
    const video = {
        id: (new Buffer(title, 'utf8')).toString('base64'),
        title,
        duration,
        released
    };

    pubsub.publish('VIDEO_ADDED', {
        videoAdded: video
    });

    videos.push(video);

    return video;
};


const getVideoById = (id) => new Promise((resolve) => {
    const [video] = videos.filter((video) => {
        return video.id === id;
    });
    resolve(video);
}); 

exports.getVideoById = getVideoById;
exports.getVideos = getVideos;
exports.createVideo = createVideo;