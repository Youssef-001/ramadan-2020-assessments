export function applyVoteStyle(
  video_id,
  votes_list,
  is_disabled,
  vote_type,
  state
) {
  const voteUpElem = document.getElementById(`votes_ups_${video_id}`);
  const voteDownElem = document.getElementById(`votes_downs_${video_id}`);

  if (is_disabled) {
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
  console.log(votes_list, vote_type);
  if (votes_list[vote_type].includes(state.userId)) {
    voteDirectionElem.style.opacity = 1;
    voteOtherElem.style.opacity = "0.5";
  } else {
    voteOtherElem.style.opacity = 1;
  }
}
