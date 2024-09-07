function getSingleVidReq(vidInfo) {
  const vidReqContainer = document.createElement("div");
  console.log(vidInfo);
  vidReqContainer.innerHTML = `        <div class="card mb-3">
          <div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
              <h3>${vidInfo.topic_title}</h3>
              <p class="text-muted mb-2">${vidInfo.topic_details}</p>
              <p class="mb-0 text-muted">
                <strong>Expected results:</strong> ${vidInfo.expected_result}
              </p>
            </div>
            <div class="d-flex flex-column text-center">
              <a class="btn btn-link">🔺</a>
              <h3>${vidInfo.votes["ups"]}</h3>
              <a class="btn btn-link">🔻</a>
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

  return vidReqContainer;
}

document.addEventListener("DOMContentLoaded", function () {
  const formVidReq = document.getElementById("formVideoRequest");
  const listOfVidsElem = document.getElementById("listOfRequests");

  fetch("http://localhost:7777/video-request")
    .then((blob) => blob.json())
    .then((data) => {
      data.forEach((vidInfo) => {
        listOfVidsElem.appendChild(getSingleVidReq(vidInfo));
      });
    });
  formVidReq.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(formVidReq);

    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: formData,
    })
      .then((data) => data.json())
      .then((data) => {
        console.log(data);
      });
  });
});
