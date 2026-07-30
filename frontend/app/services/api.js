const BASE_URL = "http://192.168.254.40:8000";
// ─── Helper ───
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong");
  }
  return data;
};

// ─── Token Storage ───
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const authHeaders = () => ({
  "Content-Type": "application/json",
  ...(authToken && { Authorization: `Bearer ${authToken}` }),
});

// ─── Auth ───
export const registerUser = async (email, password, name, surname, dob) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, surname, dob }),
  });
  return handleResponse(response);
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const forgotPassword = async (email) => {
  const response = await fetch(
    `${BASE_URL}/auth/forgot-password?email=${email}`,
    {
      method: "POST",
    },
  );
  return handleResponse(response);
};

// ─── Profile ───
export const getProfile = async (userId) => {
  const response = await fetch(`${BASE_URL}/profile/${userId}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const updatePersonal = async (userId, data) => {
  const response = await fetch(`${BASE_URL}/profile/${userId}/personal`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateLicense = async (userId, data) => {
  const response = await fetch(`${BASE_URL}/profile/${userId}/license`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updatePreferences = async (userId, data) => {
  const response = await fetch(`${BASE_URL}/profile/${userId}/preferences`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// ─── Vehicles ───
export const getVehicles = async (userId) => {
  const response = await fetch(`${BASE_URL}/vehicles/${userId}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const addVehicle = async (userId, data) => {
  const response = await fetch(`${BASE_URL}/vehicles/${userId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateVehicleById = async (userId, vehicleId, data) => {
  const response = await fetch(`${BASE_URL}/vehicles/${userId}/${vehicleId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteVehicle = async (userId, vehicleId) => {
  const response = await fetch(`${BASE_URL}/vehicles/${userId}/${vehicleId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
};

// ─── Documents ───
export const getDocuments = async (userId) => {
  const response = await fetch(`${BASE_URL}/documents/${userId}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const addDocument = async (userId, data) => {
  const response = await fetch(`${BASE_URL}/documents/${userId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteDocument = async (userId, documentId) => {
  const response = await fetch(
    `${BASE_URL}/documents/${userId}/${documentId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    },
  );
  return handleResponse(response);
};

export const getDocumentStatus = async (userId, documentId) => {
  const response = await fetch(
    `${BASE_URL}/documents/${userId}/${documentId}/status`,
    {
      headers: authHeaders(),
    },
  );
  return handleResponse(response);
};

// ─── Reminders ───
export const getReminders = async (userId) => {
  const response = await fetch(`${BASE_URL}/reminders/${userId}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const updateReminderSettings = async (userId, data) => {
  const response = await fetch(`${BASE_URL}/reminders/${userId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};
