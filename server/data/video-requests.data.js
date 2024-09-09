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

      let updated = false;

      console.log(vote_type);

      for (let i = 0; i < video.subscribers.length; i++) {
        if (video.subscribers[i].userID == userID) {
          // if (vote_type == "ups" && video.subscribers[i].count >= 1) return;
          // else if (vote_type == "downs" && video.subscribers[i].count <= -1)
          //   return;

          // if (vote_type === "ups" && video.subscribers[i].count < 1) {
          //   video.subscribers[i].count = 1; // Upvote
          // } else if (vote_type === "downs" && video.subscribers[i].count > -1) {
          //   video.subscribers[i].count = -1; // Downvote
          // }

          updated = true;
          break; // Exit loop after updating
        }
      }

      if (updated) {
      }

      // If the user was not found in the subscribers list
      if (!updated) {
        if (vote_type == "ups") {
          video.subscribers.push({ userID, count: 1 });
          // video.votes.ups += 1;
        } else {
          video.subscribers.push({ userID, count: -1 });
          // video.votes.downs += 1;
        }
      }

      // if (updated) {
      //   if (vote_type == "ups") {
      //     updateVoteForRequest(video._id, vote_type);
      //   } else {
      //     updateVoteForRequest(video._id, vote_type);
      //   }
      // }

      // console.log("before", await VideoRequest.findById(id));
      // Save the updated video request after modifications
      // console.log(video);
      video.markModified("subscribers");
      await video.save();
      // console.log("after", await VideoRequest.findById(id));

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

  modifyVote: async (id, userId, vote_type) => {
    const oldRequest = await VideoRequest.findById({ _id: id });

    if (!oldRequest) {
      throw new Error("Request not found");
    }

    const other_type = vote_type === "ups" ? "downs" : "ups";

    // Find the subscriber to update their count
    const subscriberIndex = oldRequest.subscribers.findIndex(
      (subscriber) => subscriber.userID === userId
    );

    if (subscriberIndex === -1) {
      throw new Error("Subscriber not found");
    }

    // Determine the count based on the vote_type
    const updatedCount = vote_type === "downs" ? -1 : 1;

    // Update the subscriber's count in the array
    oldRequest.subscribers[subscriberIndex].count = updatedCount;

    // Check if the vote is already in favor of the same type
    const alreadyVoted =
      oldRequest.votes[vote_type] > oldRequest.votes[other_type];

    const updatedVotes = {
      [vote_type]: alreadyVoted
        ? oldRequest.votes[vote_type] // If already voted for the same type, do nothing
        : oldRequest.votes[vote_type] + 1, // Increment the vote
      [other_type]: alreadyVoted
        ? oldRequest.votes[other_type] // If already voted for the same type, do nothing
        : oldRequest.votes[other_type] - 1, // Decrement the opposite vote
    };

    // Update the database with the new votes and subscribers array
    return VideoRequest.findByIdAndUpdate(
      { _id: id },
      {
        votes: updatedVotes,
        subscribers: oldRequest.subscribers, // Update subscribers array with new count
      },
      { new: true }
    );
  },
  deleteRequest: (id) => {
    return VideoRequest.deleteOne({ _id: id });
  },
};
