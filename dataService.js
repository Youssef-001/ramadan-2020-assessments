import { renderSingleVid } from "./renderSingleVid.js";
import { state } from "./client.js";
import api from "./api.js";
import { applyVoteStyle } from "./applyVoteStyle.js";

export default {
  addVidReq: (formData) => {
    return api.videoReq.post(formData);
  },
  deleteVideoRequest: (id) => {
    return api.videoReq.delete(id).then((data) => window.location.reload());
  },
  updateVideoStatus: (id, status, resVideo = "") => {
    return api.videoReq
      .update(id, status, resVideo)
      .then((_) => window.location.reload());
  },
  loadAllVidReqs: (
    sortBy = "newFirst",
    searchTerm = "",
    filterBy = "all",
    localstate = state
  ) => {
    const listOfVidsElem = document.getElementById("listOfRequests");
    api.videoReq.get(sortBy, searchTerm, filterBy, localstate).then((data) => {
      listOfVidsElem.innerHTML = "";
      data.forEach((vidInfo) => {
        renderSingleVid(vidInfo, localstate);
      });
    });
  },

  updateVote: (id, vote_type, user_id, videoStatus, state) => {
    const scoreVoteElem = document.getElementById(`score_vote_${id}`);

    return api.votes.update(id, vote_type, user_id).then((data) => {
      scoreVoteElem.innerText = data.votes.ups.length - data.votes.downs.length;

      applyVoteStyle(
        id,
        data["votes"],
        videoStatus === "done",
        vote_type,
        state
      );
    });
  },
};
