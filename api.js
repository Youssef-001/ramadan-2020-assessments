const apiUrl = "http://localhost:7777";

export default {
  videoReq: {
    get: (sortBy, searchTerm, filterBy, localstate) => {
      return fetch(
        `${apiUrl}/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}&filterBy=${filterBy}`
      ).then((blob) => blob.json());
    },
    post: (formData) => {
      return fetch(`${apiUrl}/video-request`, {
        method: "POST",
        body: formData,
      }).then((data) => data.json());
    },
    update: (id, status, resVideo) => {
      return fetch(`${apiUrl}/video-request`, {
        method: "PUT",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          resVideo,
        }),
      }).then((res) => res.json());
    },
    delete: (id) => {
      return fetch(`${apiUrl}/video-request`, {
        method: "DELETE",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({
          id,
        }),
      }).then((res) => res.json());
    },
  },

  votes: {
    update: (id, vote_type, user_id) => {
      return fetch(`${apiUrl}/video-request/vote`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id,
          vote_type,
          user_id,
        }),
      }).then((blob) => blob.json());
    },
  },
};
