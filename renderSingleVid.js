const listOfVidsElem = document.getElementById("listOfRequests");
import { applyVoteStyle } from "./applyVoteStyle.js";
import dataService from "./dataService.js";

function getAdminDom(_id, status) {
  return `<div class="card-header d-flex justify-content-between">
          <select id="admin_change_status_${_id}">
            <option value="new">new</option>
            <option value="planned">planned</option>
            <option value="done">done</option>
          </select>
          <div class="input-group ml-2 mr-5 ${
            status != "done" ? "d-none" : ""
          }" id = "admin_video_res_container_${_id}">
            <input type="text" class="form-control"
              id="admin_video_res_${_id}" 
              placeholder="paste here youtube video id">
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" 
                id="admin_save_video_res_${_id}"
                type="button">Save</button>
            </div>
          </div>
          <button id="admin_delete_video_req_${_id}" class='btn btn-danger'>delete</button>
        </div>`;
}

function bindAdminActions(_id, title, state, video_ref, status) {
  const admin_change_status_elem = document.getElementById(
    `admin_change_status_${_id}`
  );

  const admin_vid_res_elem = document.getElementById(`admin_video_res_${_id}`);

  const admin_vid_res_container = document.getElementById(
    `admin_video_res_container_${_id}`
  );

  const admin_save_vid_res_elem = document.getElementById(
    `admin_save_video_res_${_id}`
  );

  const admin_delete_video_request_elem = document.getElementById(
    `admin_delete_video_req_${_id}`
  );

  if (state.is_super_user) {
    admin_change_status_elem.value = status;
    admin_vid_res_elem.value = video_ref.link;

    admin_change_status_elem.addEventListener("change", (e) => {
      if (e.target.value == "done") {
        admin_vid_res_container.classList.remove("d-none");
      } else {
        dataService.updateVideoStatus(_id, e.target.value); // TODO
      }
    });
  }

  admin_save_vid_res_elem.addEventListener("click", (e) => {
    e.preventDefault();
    if (!admin_vid_res_elem.value) {
      admin_vid_res_elem.classList.add("is-invalid");
      admin_vid_res_elem.addEventListener("input", (e) =>
        admin_vid_res_elem.classList.remove("is-invalid")
      );
      return;
    }

    dataService.updateVideoStatus(_id, "done", admin_vid_res_elem.value);
  });

  admin_delete_video_request_elem.addEventListener("click", (e) => {
    e.preventDefault();
    const is_sure = confirm(`Are you sure you want to delete ${title}`);

    if (!is_sure) return;
    dataService.deleteVideoRequest(_id);
  });
}

function bindVotesActions(_id, status, state) {
  const votesElems = document.querySelectorAll(`[id^=votes_][id$=_${_id}]`);

  votesElems.forEach((elem) => {
    if (state.is_super_user || status == "done") {
      return;
    }
    elem.addEventListener("click", function (e) {
      e.preventDefault();

      let [, vote_type, id] = e.target.id.split("_");
      dataService.updateVote(id, vote_type, state.userId, status, state);
    });
  });
}

export function renderSingleVid(
  {
    _id,
    status,
    topic_title,
    topic_details,
    expected_result,
    video_ref,
    votes,
    author_name,
    submit_date,
    target_level,
  },
  state,
  isPrepend = false
) {
  const vidReqContainer = document.createElement("div");

  vidReqContainer.innerHTML = `
              <div class="card mb-3">
  
              ${state.is_super_user ? getAdminDom(_id, status) : ""}
      
            <div class="card-body d-flex justify-content-between flex-row">
              <div class="d-flex flex-column">
                <h3>${topic_title}</h3>
                <p class="text-muted mb-2">${topic_details}</p>
                <p class="mb-0 text-muted">
                  ${
                    expected_result &&
                    `<strong>Expected results:</strong> ${expected_result}`
                  }
                </p>
              </div>
  
              ${
                status === "done"
                  ? ` <div class="ml-auto mr-3">
                    <iframe width="240" height="135"
                        src="https://www.youtube.com/embed/${video_ref.link}"
                        frameborder="0" allowfullscreen></iframe>
                </div>`
                  : ""
              }
  
              <div class="d-flex flex-column text-center">
                <a class="btn btn-link" id="votes_ups_${_id}"  >🔺</a>
                <h3 id="score_vote_${_id}">${
    votes.ups.length - votes.downs.length
  }</h3>
                <a class="btn btn-link " id="votes_downs_${_id}">🔻</a>
              </div>
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
              <div class="${
                status === "done"
                  ? "text-success"
                  : status === "planned"
                  ? "text-primary"
                  : ""
              }">
                <span  >${status.toUpperCase()} ${
    status === "done"
      ? `on ${new Date(video_ref.date).toLocaleDateString()}`
      : ""
  }</span>
                &bullet; added by <strong>${author_name}</strong> on
                <strong>${new Date(submit_date).toLocaleDateString()}</strong>
              </div>
              <div
                class="d-flex justify-content-center flex-column 408ml-auto mr-2"
              >
                <div class="badge badge-success">${target_level}</div>
              </div>
            </div>
          </div>`;

  if (isPrepend) listOfVidsElem.prepend(vidReqContainer);
  else listOfVidsElem.appendChild(vidReqContainer);

  bindAdminActions(_id, topic_title, state, video_ref, status);

  const voteUpElem = document.getElementById(`votes_ups_${_id}`);
  const voteDownElem = document.getElementById(`votes_downs_${_id}`);
  const scoreVoteElem = document.getElementById(`score_vote_${_id}`);

  if (state.is_super_user) {
    applyVoteStyle(_id, votes, true, "", state);
  } else applyVoteStyle(_id, votes, status === "done", "", state);

  bindAdminActions(_id, topic_title, state, video_ref, status);
  bindVotesActions(_id, status, state);
}
