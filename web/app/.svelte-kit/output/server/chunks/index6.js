import { a as WEBUI_API_BASE_URL } from "./constants.js";
import { b as getUserPosition } from "./index4.js";
const getUsers = async (token, query, orderBy, direction, page = 1) => {
  let error = null;
  let res = null;
  const searchParams = new URLSearchParams();
  searchParams.set("page", `${page}`);
  {
    searchParams.set("order_by", orderBy);
  }
  {
    searchParams.set("direction", direction);
  }
  res = await fetch(`${WEBUI_API_BASE_URL}/users/?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getUserSettings = async (token) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/users/user/settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const updateUserSettings = async (token, settings) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/users/user/settings/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...settings
    })
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getUserById = async (token, userId) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const updateUserInfo = async (token, info) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/users/user/info/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...info
    })
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getAndUpdateUserLocation = async (token) => {
  const location = await getUserPosition().catch((err) => {
    return null;
  });
  if (location) {
    await updateUserInfo(token, { location });
    return location;
  } else {
    console.info("Failed to get user location");
    return null;
  }
};
const getUserGroupsById = async (token, userId) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/users/${userId}/groups`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
export {
  getUsers as a,
  getAndUpdateUserLocation as b,
  getUserSettings as c,
  getUserById as d,
  getUserGroupsById as g,
  updateUserSettings as u
};
//# sourceMappingURL=index6.js.map
