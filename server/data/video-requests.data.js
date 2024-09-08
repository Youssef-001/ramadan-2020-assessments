var VideoRequest = require("./../models/video-requests.model");
const User = require("./../models/user.model");
module.exports = {
  createRequest: async (vidRequestData) => {
    console.log(vidRequestData);
    const authorId = vidRequestData.author_id;

    if (authorId) {
      const userObj = await User.findOne({ _id: authorId });
      vidRequestData.author_name = userObj.author_name;
      vidRequestData.author_email = userObj.author_email;
    }

    let newRequest = new VideoRequest(vidRequestData);
    return newRequest.save();
  },

  getAllVideoRequests: (top) => {
    return VideoRequest.find({}).sort({ submit_date: "-1" }).limit(top);
  },

  searchRequests: (topic) => {
    return VideoRequest.find({
      topic_title: { $regex: topic, $options: "i" },
    }).sort({ addedAt: "-1" });
  },

  addSubscriber: async (userID, id, vote_type) => {
    try {
      // Find the video request by id
      let video = await VideoRequest.findById(id);
      console.log(video);

      if (!video) {
        throw new Error("Video request not found");
      }

      console.log("here", userID);
      console.log(video.subscribers);

      for (let i = 0; i < video.subscribers.length; i++) {
        if (
          video.subscribers[i].userID == userID &&
          video.subscribers[i].vote_type == vote_type
        )
          return;
      }

      let flag = true;

      for (let i = 0; i < video.subscribers.length; i++) {
        if (video.subscribers[i].userID == userID) {
          flag = false;
          break;
        }
      }

      if (flag) video.subscribers.push({ userID, vote_type });

      // Save the updated video request
      await video.save();

      return video; // Return the updated video request
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getRequestById: (id) => {
    return VideoRequest.findById({ _id: id });
  },

  updateRequest: (id, status, resVideo) => {
    const updates = {
      status: status,
      video_ref: {
        link: resVideo,
        date: resVideo && new Date(),
      },
    };

    return VideoRequest.findByIdAndUpdate(id, updates, { new: true });
  },

  updateVoteForRequest: async (id, vote_type) => {
    const oldRequest = await VideoRequest.findById({ _id: id });
    const other_type = vote_type === "ups" ? "downs" : "ups";
    return VideoRequest.findByIdAndUpdate(
      { _id: id },
      {
        votes: {
          [vote_type]: ++oldRequest.votes[vote_type],
          [other_type]: oldRequest.votes[other_type],
        },
      },
      { new: true }
    );
  },

  deleteRequest: (id) => {
    return VideoRequest.deleteOne({ _id: id });
  },
};
