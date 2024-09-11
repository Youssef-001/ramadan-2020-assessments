import { debounce } from "./debounce.js";
import { renderSingleVid } from "./renderSingleVid.js";
import dataService from "./dataService.js";
import { checkValidity } from "./checkValidity.js";

import api from "./api.js";

const SUPER_USER_ID = "28805";

export const state = {
  sortBy: "newFirst",
  searchTerm: "",
  userId: "",
  is_super_user: false,
  filterBy: "all",
};

document.addEventListener("DOMContentLoaded", function () {
  const formVidReq = document.getElementById("formVideoRequest");

  const sortByElems = document.querySelectorAll("[id*=sort_by_]");

  let filterButtons = document.querySelectorAll(`[id^=filter_by_]`);

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

  dataService.loadAllVidReqs();
  filterButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      state.filterBy = e.target.getAttribute("id").split("_")[2];
      filterButtons.forEach((option) => option.classList.remove("active"));
      e.target.classList.add("active");
      dataService.loadAllVidReqs(
        state.sortBy,
        state.searchTerm,
        state.filterBy
      );
    });
  });

  sortByElems.forEach((elem) => {
    elem.addEventListener("click", function (e) {
      e.preventDefault();

      state.sortBy = this.querySelector("input").value;
      dataService.loadAllVidReqs(
        state.sortBy,
        state.searchTerm,
        state.filterBy
      );

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
      dataService.loadAllVidReqs(
        state.sortBy,
        state.searchTerm,
        state.filterBy
      );
    }, 250)
  );

  formVidReq.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(formVidReq);
    const isValid = checkValidity(formData);

    formData.append("author_id", state.userId);

    if (!isValid) return;
    dataService.addVidReq(formData).then((data) => {
      console.log("here", data);
      renderSingleVid(data, state, true);
    });
  });
});
