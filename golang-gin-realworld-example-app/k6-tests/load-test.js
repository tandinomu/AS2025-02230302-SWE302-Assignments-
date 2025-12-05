import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, THRESHOLDS } from './config.js';
import { getAuthHeaders } from './helpers.js';

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 0 },
  ],
  thresholds: THRESHOLDS,
};

export function setup() {
  const loginRes = http.post(`${BASE_URL}/users/login`, JSON.stringify({
    user: { email: 'test@example.com', password: 'password' }
  }), { headers: { 'Content-Type': 'application/json' } });

  if (loginRes.status === 200) {
    return { token: loginRes.json('user.token') };
  }

  const registerRes = http.post(`${BASE_URL}/users`, JSON.stringify({
    user: { email: 'test@example.com', username: 'testuser', password: 'password' }
  }), { headers: { 'Content-Type': 'application/json' } });

  return { token: registerRes.json('user.token') };
}

export default function (data) {
  const authHeaders = getAuthHeaders(data.token);

  let response = http.get(`${BASE_URL}/articles`, authHeaders);
  check(response, {
    'articles list status is 200': (r) => r.status === 200,
  });
  sleep(1);

  response = http.get(`${BASE_URL}/tags`, authHeaders);
  check(response, {
    'tags status is 200': (r) => r.status === 200,
  });
  sleep(1);

  response = http.get(`${BASE_URL}/user`, authHeaders);
  check(response, {
    'current user status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
