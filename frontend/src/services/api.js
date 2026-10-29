const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function request(path, options = {}) {
  if (!API_BASE_URL) return null;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) } });
  } catch (error) {
    if (error instanceof TypeError) throw new Error(`Backend API is unavailable at ${API_BASE_URL}. Start the backend service and try again.`);
    throw error;
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail ?? 'The service could not complete this request.');
  return body;
}

export async function registerStudent(payload) {
  return request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function loginStudent(payload) {
  return request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

export async function requestLoginOtp(payload) {
  return request('/api/v1/auth/login/request-otp', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getCurrentUser(token) {
  return request('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } });
}

export async function saveIdentity(token, payload) {
  return request('/api/v1/student/identity', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function submitSocialSubmission(token, payload) {
  return request('/api/v1/student/social-submissions', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function getStudentResource(token, path) {
  return request(`/api/v1/student/${path}`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function getPublicResource(path) {
  return request(`/api/v1/student/${path}`);
}

export async function completeQuest(token, payload) {
  return request('/api/v1/student/quests/complete', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function submitProject(token, payload) {
  return request('/api/v1/student/project', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function submitArenaQuiz(token, payload) {
  return request('/api/v1/student/quiz-attempts', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function verifyEmail(token) {
  const result = await request('/api/v1/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) });
  if (!result) throw new Error('Backend API is not connected. Set VITE_API_BASE_URL and restart the frontend.');
  return result;
}

export async function resendVerification(email) {
  const result = await request('/api/v1/auth/verify-email/resend', { method: 'POST', body: JSON.stringify({ email }) });
  if (!result) throw new Error('Backend API is not connected. Set VITE_API_BASE_URL and restart the frontend.');
  return result;
}

export async function requestPasswordReset(email) {
  return request('/api/v1/auth/password-reset/request', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetPassword(token, newPassword) {
  return request('/api/v1/auth/password-reset/confirm', { method: 'POST', body: JSON.stringify({ token, new_password: newPassword }) });
}

async function adminRequest(path, adminKey, options = {}) {
  return request(path, { ...options, headers: { 'X-Admin-Key': adminKey, ...(options.headers ?? {}) } });
}

export async function getAdminOverview(adminKey) {
  return adminRequest('/api/v1/admin/overview', adminKey);
}

export async function updateAdminWorkshop(adminKey, payload) {
  return adminRequest('/api/v1/admin/workshop', adminKey, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function sendCollegeOutreach(adminKey, payload) {
  return adminRequest('/api/v1/admin/college-outreach', adminKey, { method: 'POST', body: JSON.stringify(payload) });
}
