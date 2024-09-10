const listOfVidsElem = document.getElementById("listOfRequests");
const SUPER_USER_ID = "28805";

const state = {
  sortBy: "newFirst",
  searchTerm: "",
  userId: "",
  is_super_user: false,
};

function renderSingleVid(vidInfo, isPrepend = false) {
  const vidReqContainer = document.createElement("div");
  vidReqContainer.innerHTML = `        <div class="card mb-3">

            ${
              state.is_super_user
                ? `<div class="card-header d-flex justify-content-between">
          <select id="admin_change_status_${vidInfo._id}">
            <option value="new">new</option>
            <option value="planned">planned</option>
            <option value="done">done</option>
          </select>
          <div class="input-group ml-2 mr-5 ${
            vidInfo.status != "done" ? "d-none" : ""
          }" id = "admin_video_res_container_${vidInfo._id}">
            <input type="text" class="form-control"
              id="admin_video_res_${vidInfo._id}" 
              placeholder="paste here youtube video id">
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" 
                id="admin_save_video_res_${vidInfo._id}"
                type="button">Save</button>
            </div>
          </div>
          <button id="admin_delete_video_req_${
            vidInfo._id
          }" class='btn btn-danger'>delete</button>
        </div>`
                : ""
            }
    
          <div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
              <h3>${vidInfo.topic_title}</h3>
              <p class="text-muted mb-2">${vidInfo.topic_details}</p>
              <p class="mb-0 text-muted">
                ${
                  vidInfo.expected_result &&
                  `<strong>Expected results:</strong> ${vidInfo.expected_result}`
                }
              </p>
            </div>
            <div class="d-flex flex-column text-center">
              <a class="btn btn-link" id="votes_ups_${vidInfo._id}"  >🔺</a>
              <h3 id="score_vote_${vidInfo._id}">${
    vidInfo.votes.ups.length - vidInfo.votes.downs.length
  }</h3>
              <a class="btn btn-link " id="votes_downs_${vidInfo._id}">🔻</a>
            </div>
          </div>
          <div class="card-footer d-flex flex-row justify-content-between">
            <div>
              <span class="text-info">NEW</span>
              &bullet; added by <strong>${vidInfo.author_name}</strong> on
              <strong>${new Date(vidInfo.submit_date).toString()}</strong>
            </div>
            <div
              class="d-flex justify-content-center flex-column 408ml-auto mr-2"
            >
              <div class="badge badge-success">${vidInfo.target_level}</div>
            </div>
          </div>
        </div>`;

  if (isPrepend) listOfVidsElem.prepend(vidReqContainer);
  else listOfVidsElem.appendChild(vidReqContainer);

  const admin_change_status_elem = document.getElementById(
    `admin_change_status_${vidInfo._id}`
  );

  const admin_vid_res_elem = document.getElementById(
    `admin_video_res_${vidInfo._id}`
  );

  const admin_vid_res_container = document.getElementById(
    `admin_video_res_container_${vidInfo._id}`
  );

  const admin_save_vid_res_elem = document.getElementById(
    `admin_save_video_res_${vidInfo._id}`
  );

  const admin_delete_video_request_elem = document.getElementById(
    `admin_delete_video_req_${vidInfo._id}`
  );

  if (state.is_super_user) {
    admin_change_status_elem.value = vidInfo.status;
    admin_vid_res_elem.value = vidInfo.video_ref.link;

    admin_change_status_elem.addEventListener("change", (e) => {
      if (e.target.value == "done") {
        admin_vid_res_container.classList.remove("d-none");
      } else {
        updateVideoStatus(vidInfo._id, e.target.value);
      }
    });

    admin_save_vid_res_elem.addEventListener("click", (e) => {
      e.preventDefault();
      if (!admin_vid_res_elem.value) {
        admin_vid_res_elem.classList.add("is-invalid");
        admin_vid_res_elem.addEventListener("input", (e) =>
          admin_vid_res_elem.classList.remove("is-invalid")
        );
        return;
      }

      updateVideoStatus(vidInfo._id, "done", admin_vid_res_elem.value);
    });

    admin_delete_video_request_elem.addEventListener("click", (e) => {
      e.preventDefault();
      const is_sure = confirm(
        `Are you sure you want to delete ${vidInfo.topic_title}`
      );

      if (!is_sure) return;
      fetch("http://localhost:7777/video-request", {
        method: "DELETE",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({
          id: vidInfo._id,
        }),
      })
        .then((res) => res.json())
        .then((data) => window.location.reload());
    });
  }
  applyVoteStyle(vidInfo._id, vidInfo["votes"]);

  const voteUpElem = document.getElementById(`votes_ups_${vidInfo._id}`);
  const voteDownElem = document.getElementById(`votes_downs_${vidInfo._id}`);
  const scoreVoteElem = document.getElementById(`score_vote_${vidInfo._id}`);

  const votesElems = document.querySelectorAll(
    `[id^=votes_][id$=_${vidInfo._id}]`
  );

  function updateVideoStatus(id, status, resVideo = "") {
    fetch("http://localhost:7777/video-request", {
      method: "PUT",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        resVideo,
      }),
    })
      .then((res) => res.json())
      .then((data) => window.location.reload());
  }

  votesElems.forEach((elem) => {
    if (state.is_super_user) {
      return;
    }
    elem.addEventListener("click", function (e) {
      e.preventDefault();

      let [, vote_type, id] = e.target.id.split("_");
      fetch("http://localhost:7777/video-request/vote", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id,
          vote_type,
          user_id: state.userId,
        }),
      })
        .then((blob) => blob.json())
        .then((data) => {
          scoreVoteElem.innerText =
            data.votes.ups.length - data.votes.downs.length;

          applyVoteStyle(id, data["votes"], vote_type);
        });
    });
  });
}

function applyVoteStyle(video_id, votes_list, vote_type) {
  const voteUpElem = document.getElementById(`votes_ups_${video_id}`);
  const voteDownElem = document.getElementById(`votes_downs_${video_id}`);

  if (state.is_super_user) {
    voteUpElem.style.opacity = "0.5";
    voteDownElem.style.opacity = "0.5";
    voteDownElem.style.cursor = "not-allowed";
    voteUpElem.style.cursor = "not-allowed";

    return;
  }
  if (!vote_type) {
    if (votes_list.ups.includes(state.userId)) vote_type = "ups";
    else if (votes_list.downs.includes(state.userId)) vote_type = "downs";
    else {
      return;
    }
  }
  const voteDirectionElem = vote_type == "ups" ? voteUpElem : voteDownElem;

  const voteOtherElem = vote_type == "ups" ? voteDownElem : voteUpElem;

  if (votes_list[vote_type].includes(state.userId)) {
    console.log("test");
    voteDirectionElem.style.opacity = 1;
    voteOtherElem.style.opacity = "0.5";
  } else {
    voteOtherElem.style.opacity = 1;
  }
}

function loadAllVidReqs(sortBy = "newFirst", searchTerm = "") {
  fetch(
    `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`
  )
    .then((blob) => blob.json())
    .then((data) => {
      listOfVidsElem.innerHTML = "";
      data.forEach((vidInfo) => {
        renderSingleVid(vidInfo);
      });
    });
}

function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

function checkValidity(formData) {
  const topic = formData.get("topic_title");
  const topicDetails = formData.get("topic_details");

  if (!topic || topic.length > 30) {
    document.querySelector("[name=topic_title]").classList.add("is-invalid");
  }

  if (!topicDetails) {
    document.querySelector("[name=topic_details]").classList.add("is-invalid");
  }

  const allInvalidElems = document
    .getElementById("formVideoRequest")
    .querySelectorAll(".is-invalid");

  if (allInvalidElems.length) {
    allInvalidElems.forEach((elem) => {
      elem.addEventListener("input", function (e) {
        this.classList.remove("is-invalid");
      });
    });
    return false;
  }

  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  const formVidReq = document.getElementById("formVideoRequest");

  const sortByElems = document.querySelectorAll("[id*=sort_by_]");

  const searchBox = document.getElementById("search_box");

  const formLoginElm = document.querySelector(".form-login");
  const appContentElm = document.querySelector(".app-content");

  if (window.location.search) {
    state.userId = new URLSearchParams(window.location.search).get("id");
    if (state.userId == SUPER_USER_ID) {
      state.is_super_user = true;
      document.querySelector(".normal_user_content").classList.add("d-none");
    }
    console.log(state.userId);
    formLoginElm.classList.add("d-none");
    appContentElm.classList.remove("d-none");
  }

  loadAllVidReqs();

  sortByElems.forEach((elem) => {
    elem.addEventListener("click", function (e) {
      e.preventDefault();

      state.sortBy = this.querySelector("input").value;
      loadAllVidReqs(state.sortBy, state.searchTerm);

      this.classList.add("active");
      if (state.sortBy == "topVotedFirst") {
        document.getElementById("sort_by_new").classList.remove("active");
      } else document.getElementById("sort_by_top").classList.remove("active");
    });
  });

  searchBox.addEventListener(
    "input",
    debounce((e) => {
      state.searchTerm = e.target.value;
      loadAllVidReqs(state.sortBy, state.searchTerm);
    }, 250)
  );

  formVidReq.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(formVidReq);
    const isValid = checkValidity(formData);

    formData.append("author_id", state.userId);

    if (!isValid) return;

    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: formData,
    })
      .then((data) => data.json())
      .then((data) => {
        renderSingleVid(data, true);
      });
  });
});
