import { Platform } from 'react-native';

const LOCALHOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

// Replace with your machine LAN IP when running on a physical device, e.g.
// export const BASE_URL = 'http://192.168.1.42:5000';
export const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || LOCALHOST;

async function handleResponse(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, ...json };
  return json;
}

export async function loginRequest(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function registerRequest(name: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
}

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/`, { method: 'GET' });
    return res.status === 200;
  } catch (error) {
    return false;
  }
}

export async function getUserProfile() {
  const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('token'));
  const res = await fetch(`${BASE_URL}/api/users/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

export async function getForms() {
  const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('token'));
  const res = await fetch(`${BASE_URL}/api/forms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

export async function getFormDetail(id: string) {
  const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('token'));
  const res = await fetch(`${BASE_URL}/api/forms/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

export async function getFormResponses(formId: string) {
  const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('token'));
  const res = await fetch(`${BASE_URL}/api/responses/form/${formId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

export async function getResponseDetail(id: string) {
  const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('token'));
  const res = await fetch(`${BASE_URL}/api/responses/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

export async function generateFormWithAI(prompt: string) {
  const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('token'));
  const res = await fetch(`${BASE_URL}/api/forms/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });
  return handleResponse(res);
}

export async function updateForm(id: string, formData: any) {
  const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('token'));
  const res = await fetch(`${BASE_URL}/api/forms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });
  return handleResponse(res);
}

export async function publishForm(id: string) {
  const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('token'));
  const res = await fetch(`${BASE_URL}/api/forms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status: 'published' }),
  });
  return handleResponse(res);
}