const listOfVidsElem = document.getElementById("listOfRequests");

const state = {
  sortBy: "newFirst",
  searchTerm: "",
  userId: "",
};

function renderSingleVid(vidInfo, isPrepend = false) {
  const vidReqContainer = document.createElement("div");
  vidReqContainer.innerHTML = `        <div class="card mb-3">
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
    vidInfo.votes["ups"] - vidInfo.votes["downs"]
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

  const voteUpElem = document.getElementById(`votes_ups_${vidInfo._id}`);
  const voteDownElem = document.getElementById(`votes_downs_${vidInfo._id}`);
  const scoreVoteElem = document.getElementById(`score_vote_${vidInfo._id}`);

  voteUpElem.addEventListener("click", async (e) => {
    let jsonData = await fetch("http://localhost:7777/video-request");
    let videos = await jsonData.json();
    let video;

    for (let i = 0; i < videos.length; i++) {
      if (e.target.id.split("_")[2] == videos[i]._id) {
        video = videos[i];
      }
    }
    console.log(video);
    if (video) {
      for (let i = 0; i < video.subscribers.length; i++) {
        if (
          video.subscribers[i].userID == state.userId
          //&&video.subscribers[i].vote_type == "ups"
        )
          return;
      }
    }

    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: vidInfo._id,
        vote_type: "ups",
        userID: state.userId,
      }),
    })
      .then((blob) => blob.json())
      .then((data) => {
        scoreVoteElem.innerText = data.votes.ups - data.votes.downs;
      });
  });

  voteDownElem.addEventListener("click", async (e) => {
    let jsonData = await fetch("http://localhost:7777/video-request");
    let videos = await jsonData.json();
    let video;

    for (let i = 0; i < videos.length; i++) {
      if (e.target.id.split("_")[2] == videos[i]._id) {
        video = videos[i];
      }
    }
    console.log(video);
    if (video) {
      for (let i = 0; i < video.subscribers.length; i++) {
        if (
          video.subscribers[i].userID == state.userId
          //&&video.subscribers[i].vote_type == "downs"
        )
          return;
      }
    }

    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: vidInfo._id,
        vote_type: "downs",
        userID: state.userId,
      }),
    })
      .then((blob) => blob.json())
      .then((data) => {
        console.log(data);
        scoreVoteElem.innerText = data.votes.ups - data.votes.downs;
      });
  });
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
