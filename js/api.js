// api.js — shared helpers for the admin frontend
// Uses its own localStorage keys so it never collides with the student site
// even if someone somehow shares the same browser/origin.

const AdminAuth = {
  TOKEN_KEY: "eb_admin_token",

  setToken(token) { localStorage.setItem(this.TOKEN_KEY, token); },
  getToken() { return localStorage.getItem(this.TOKEN_KEY); },
  clearToken() { localStorage.removeItem(this.TOKEN_KEY); },
  isLoggedIn() { return !!this.getToken(); },
};

async function adminApiRequest(path, { method = "GET", body = null, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = AdminAuth.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
  } catch (err) {
    return { success: false, message: "Could not reach the server. Please check your connection and try again." };
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    return { success: false, message: "Unexpected server response." };
  }

  if (response.status === 401 && auth) {
    AdminAuth.clearToken();
  }

  return data;
}

async function adminApiUpload(path, formData) {
  const token = AdminAuth.getToken();
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  } catch (err) {
    return { success: false, message: "Could not reach the server. Please check your connection and try again." };
  }
  try {
    return await response.json();
  } catch (err) {
    return { success: false, message: "Unexpected server response." };
  }
}

function showAlert(el, message, type = "error") {
  el.textContent = message;
  el.className = `alert show alert-${type}`;
}

function hideAlert(el) {
  el.className = "alert";
  el.textContent = "";
}

function setLoading(button, isLoading, loadingText = "Please wait...") {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function requireAdminAuthOrRedirect() {
  if (!AdminAuth.isLoggedIn()) {
    window.location.href = "index.html";
  }
}
