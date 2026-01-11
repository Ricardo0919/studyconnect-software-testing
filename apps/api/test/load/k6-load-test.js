import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    // Constant load test
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '0s',
    },
    // Ramp-up test
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '30s', target: 20 },
        { duration: '10s', target: 0 },
      ],
      startTime: '35s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Health check
  const health = http.get(`${BASE_URL}/health`);
  check(health, { 'health ok': (r) => r.status === 200 });

  // Get tasks
  const tasks = http.get(`${BASE_URL}/tasks`);
  check(tasks, { 'tasks ok': (r) => r.status === 200 });

  // Get users
  const users = http.get(`${BASE_URL}/users`);
  check(users, { 'users ok': (r) => r.status === 200 });

  sleep(1);
}
