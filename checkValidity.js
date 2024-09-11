export function checkValidity(formData) {
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
