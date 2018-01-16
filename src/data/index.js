const videoA = {
    id: 'a',
    title: 'Ember',
    duration: 240,
    watched: false
};
  
const videoB = {
    id: 'b',
    title: 'Scott',
    duration: 244,
    watched: true
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