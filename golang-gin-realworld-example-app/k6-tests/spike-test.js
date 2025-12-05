import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './config.js';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 10 },
    { duration: '10s', target: 500 },
    { duration: '3m', target: 500 },
    { duration: '10s', target: 10 },
    { duration: '3m', target: 10 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const response = http.get(`${BASE_URL}/articles`);
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
