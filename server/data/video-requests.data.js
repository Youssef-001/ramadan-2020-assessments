var VideoRequest = require("./../models/video-requests.model");

module.exports = {
  createRequest: (vidRequestData) => {
    let newRequest = new VideoRequest(vidRequestData);
    return newRequest.save();
  },

  getAllVideoRequests: (filterBy) => {
    const filter = filterBy == "all" ? {} : { status: filterBy };
    return VideoRequest.find(filter).sort({ submit_date: "-1" });
  },

  searchRequests: (topic, filterBy) => {
    const filter = filterBy === "all" ? {} : { status: filterBy };
    return VideoRequest.find({
      topic_title: { $regex: topic, $options: "i" },
      ...filter,
    }).sort({ addedAt: "-1" });
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

  updateVoteForRequest: async (id, vote_type, user_id) => {
    const oldRequest = await VideoRequest.findById({ _id: id });
    const other_type = vote_type === "ups" ? "downs" : "ups";

    const oldVoteList = oldRequest.votes[vote_type];
    const oldOtherList = oldRequest.votes[other_type];

    if (!oldVoteList.includes(user_id)) {
      oldVoteList.push(user_id);
    } else {
      oldVoteList.splice(user_id);
    }

    if (oldOtherList.includes(user_id)) oldOtherList.splice(user_id);

    return VideoRequest.findByIdAndUpdate(
      { _id: id },
      {
        votes: {
          [vote_type]: oldVoteList,
          [other_type]: oldOtherList,
        },
      },
      { new: true }
    );
  },

  deleteRequest: (id) => {
    return VideoRequest.deleteOne({ _id: id });
  },
};
