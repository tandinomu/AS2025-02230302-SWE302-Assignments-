// k6 Helper Functions
import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './config.js';

export function registerUser(email, username, password) {
  const payload = JSON.stringify({
    user: { email, username, password }
  });

  const params = {
    headers: { 'Content-Type': 'application/json' }
  };

  const response = http.post(`${BASE_URL}/users`, payload, params);

  check(response, {
    'registration successful': (r) => r.status === 200 || r.status === 201,
  });

  return response.json('user.token');
}

export function login(email, password) {
  const payload = JSON.stringify({
    user: { email, password }
  });

  const params = {
    headers: { 'Content-Type': 'application/json' }
  };

  const response = http.post(`${BASE_URL}/users/login`, payload, params);

  check(response, {
    'login successful': (r) => r.status === 200,
  });

  return response.json('user.token');
}

export function getAuthHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    }
  };
}
