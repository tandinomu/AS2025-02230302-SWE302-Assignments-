# Assignment 3: Performance Testing & End-to-End Testing

## Overview
In this assignment, you will perform performance testing on the backend API using k6 and implement comprehensive end-to-end tests for the frontend application using Cypress. You'll learn to identify performance bottlenecks, establish performance baselines, and ensure the application works correctly from a user's perspective.

## Learning Objectives
- Conduct load, stress, and spike testing
- Analyze performance metrics and identify bottlenecks
- Write end-to-end tests that simulate real user workflows
- Implement performance budgets and monitoring
- Use industry-standard tools (k6, Cypress)

---

## Part A: Performance Testing with k6

### Prerequisites
- Backend running on `http://localhost:8080`
- k6 installed
- Understanding of HTTP APIs and performance metrics

---

## Task 1: k6 Setup and Configuration (10 points)

** You are encouraged to run it on k6 cloud and screenshot the dashboard for the report of tests conducted.**

### 1.1 Install k6

#### macOS
```bash
brew install k6
```

#### Linux
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

#### Windows
```bash
choco install k6
```

#### Verify Installation
```bash
k6 version
```

### 1.2 Create k6 Project Structure

Create the following directory structure:
```
golang-gin-realworld-example-app/
├── k6-tests/
│   ├── load-test.js
│   ├── stress-test.js
│   ├── spike-test.js
│   ├── soak-test.js
│   ├── helpers.js
│   └── config.js
```

**Deliverable 1.2.1:** `k6-tests/config.js`
```javascript
export const BASE_URL = 'http://localhost:8080/api';

export const THRESHOLDS = {
  http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
};

export const TEST_USER = {
  email: 'perf-test@example.com',
  password: 'PerfTest123!',
  username: 'perftest'
};
```

**Deliverable 1.2.2:** `k6-tests/helpers.js`
```javascript
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
```

---

## Task 2: Load Testing (40 points)

### 2.1 Basic Load Test

Create `k6-tests/load-test.js`:

**Deliverable 2.1.1:** Implement load test with the following scenarios:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, THRESHOLDS } from './config.js';
import { login, getAuthHeaders } from './helpers.js';

export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users over 2 minutes
    { duration: '5m', target: 10 },   // Stay at 10 users for 5 minutes
    { duration: '2m', target: 50 },   // Ramp up to 50 users over 2 minutes
    { duration: '5m', target: 50 },   // Stay at 50 users for 5 minutes
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: THRESHOLDS,
};

let token;

export function setup() {
  // Setup: Create test user and get token
  // This runs once before the test
  const loginRes = http.post(`${BASE_URL}/users/login`, JSON.stringify({
    user: {
      email: 'test@example.com',
      password: 'password'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  return { token: loginRes.json('user.token') };
}

export default function (data) {
  const authHeaders = getAuthHeaders(data.token);

  // Test 1: Get articles list
  let response = http.get(`${BASE_URL}/articles`, authHeaders);
  check(response, {
    'articles list status is 200': (r) => r.status === 200,
    'articles list has data': (r) => r.json('articles') !== null,
  });
  sleep(1);

  // Test 2: Get tags
  response = http.get(`${BASE_URL}/tags`, authHeaders);
  check(response, {
    'tags status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // Test 3: Get current user
  response = http.get(`${BASE_URL}/user`, authHeaders);
  check(response, {
    'current user status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // Test 4: Create article
  const articlePayload = JSON.stringify({
    article: {
      title: `Test Article ${Date.now()}`,
      description: 'Performance test article',
      body: 'This is a test article for performance testing',
      tagList: ['test', 'performance']
    }
  });

  response = http.post(`${BASE_URL}/articles`, articlePayload, authHeaders);
  check(response, {
    'article created': (r) => r.status === 200 || r.status === 201,
  });

  if (response.status === 200 || response.status === 201) {
    const slug = response.json('article.slug');

    // Test 5: Get single article
    response = http.get(`${BASE_URL}/articles/${slug}`, authHeaders);
    check(response, {
      'get article status is 200': (r) => r.status === 200,
    });
    sleep(1);

    // Test 6: Favorite article
    response = http.post(`${BASE_URL}/articles/${slug}/favorite`, null, authHeaders);
    check(response, {
      'favorite successful': (r) => r.status === 200,
    });
    sleep(1);
  }
}

export function teardown(data) {
  // Cleanup if needed
}
```

#### Run Load Test
```bash
cd golang-gin-realworld-example-app/k6-tests
k6 run load-test.js

# Generate HTML report
k6 run --out json=load-test-results.json load-test.js
```

### 2.2 Analyze Load Test Results

**Deliverable 2.2.1:** `k6-load-test-analysis.md`

Document the following:

1. **Test Configuration**
   - Virtual users (VUs) profile
   - Test duration
   - Ramp-up/ramp-down strategy

2. **Performance Metrics**
   - Total requests made
   - Requests per second (RPS)
   - Average response time
   - p95 response time
   - p99 response time
   - Min/Max response times

3. **Request Analysis**
   - Breakdown by endpoint:
     - GET /api/articles
     - GET /api/tags
     - GET /api/user
     - POST /api/articles
     - GET /api/articles/:slug
     - POST /api/articles/:slug/favorite

4. **Success/Failure Rates**
   - Total successful requests
   - Failed requests (count and percentage)
   - Error types and causes

5. **Threshold Analysis**
   - Which thresholds passed/failed
   - Response time distribution
   - Error rate analysis

6. **Resource Utilization** (check server during test)
   - CPU usage
   - Memory usage
   - Database connections
   - Any bottlenecks identified

7. **Findings and Recommendations**
   - Performance bottlenecks
   - Slow endpoints
   - Optimization suggestions

**Include:**
- Screenshots of k6 terminal output and grafana dashboards (if applicable)
- Performance graphs (if using k6 cloud or Grafana)
- Server monitoring screenshots

---

## Task 3: Stress Testing (30 points)

### 3.1 Implement Stress Test

Create `k6-tests/stress-test.js`:

**Deliverable 3.1.1:** Stress test to find breaking point

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from './config.js';
import { login, getAuthHeaders } from './helpers.js';

export const options = {
  stages: [
    { duration: '2m', target: 50 },    // Ramp up to 50 users
    { duration: '5m', target: 50 },    // Stay at 50 for 5 minutes
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 for 5 minutes
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 for 5 minutes
    { duration: '2m', target: 300 },   // Beyond normal load
    { duration: '5m', target: 300 },   // Stay at peak
    { duration: '5m', target: 0 },     // Ramp down gradually
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // More relaxed threshold
    http_req_failed: ['rate<0.1'],     // Allow up to 10% errors
  },
};

// Similar test flow as load test but with more aggressive user counts
export default function () {
  // Test most critical endpoints under stress
  const response = http.get(`${BASE_URL}/articles`);
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

#### Run Stress Test
```bash
k6 run stress-test.js --out json=stress-test-results.json
```

### 3.2 Analyze Stress Test Results

**Deliverable 3.2.1:** `k6-stress-test-analysis.md`

Document:

1. **Breaking Point Analysis**
   - At what VU count did performance degrade?
   - At what point did errors start occurring?
   - Maximum sustainable load

2. **Degradation Pattern**
   - How did response times increase with load?
   - Which endpoints failed first?
   - Error patterns observed

3. **Recovery Analysis**
   - How did the system recover during ramp-down?
   - Any lingering issues after load decreased?
   - Time to return to normal performance

4. **Failure Modes**
   - Types of errors encountered
   - Database connection issues
   - Timeout errors
   - Resource exhaustion

---

## Task 4: Spike Testing (20 points)

### 4.1 Implement Spike Test

Create `k6-tests/spike-test.js`:

**Deliverable 4.1.1:** Test sudden traffic spikes

```javascript
import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './config.js';

export const options = {
  stages: [
    { duration: '10s', target: 10 },    // Normal load
    { duration: '30s', target: 10 },    // Stable
    { duration: '10s', target: 500 },   // Sudden spike!
    { duration: '3m', target: 500 },    // Stay at spike
    { duration: '10s', target: 10 },    // Back to normal
    { duration: '3m', target: 10 },     // Recovery period
    { duration: '10s', target: 0 },     // Ramp down
  ],
};

export default function () {
  const response = http.get(`${BASE_URL}/articles`);
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
```

### 4.2 Analyze Spike Test Results

**Deliverable 4.2.1:** `k6-spike-test-analysis.md`

Document:

1. **Spike Impact**
   - System response to sudden load increase
   - Error rate during spike
   - Response time during spike

2. **Recovery**
   - How long to recover after spike?
   - Any cascading failures?
   - System stability after spike

3. **Real-World Scenarios**
   - Marketing campaign launch
   - Viral content
   - Bot attack mitigation

---

## Task 5: Soak Testing (30 points)

### 5.1 Implement Soak Test

Create `k6-tests/soak-test.js`:

**Deliverable 5.1.1:** Test for memory leaks and degradation over time

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from './config.js';

export const options = {
  stages: [
    { duration: '2m', target: 50 },     // Ramp up
    { duration: '3h', target: 50 },     // Stay at load for 3 hours
    { duration: '2m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Realistic user behavior
  http.get(`${BASE_URL}/articles`);
  sleep(3);

  http.get(`${BASE_URL}/tags`);
  sleep(2);
}
```

**Note:** This test takes 3+ hours. You may reduce duration to 30 minutes for the assignment, but document the difference.

### 5.2 Analyze Soak Test Results

**Deliverable 5.2.1:** `k6-soak-test-analysis.md`

Document:

1. **Performance Over Time**
   - Response time trends
   - Any performance degradation?
   - Memory usage trends

2. **Resource Leaks**
   - Memory leaks detected?
   - Database connection leaks?
   - File handle leaks?

3. **Stability Assessment**
   - System stable over extended period?
   - Any crashes or errors?
   - Recommendations for production

---

## Task 6: Performance Optimization (30 points)

Based on test results, implement optimizations:

### 6.1 Backend Optimizations

**Required Optimizations:**

1. **Database Query Optimization**
   - Add database indexes
   - Optimize N+1 queries
   - Use eager loading

**Case 1: Add Database Indexes**
```go
// In models.go
func AutoMigrate() {
    db := common.GetDB()

    db.AutoMigrate(&User{})
    db.AutoMigrate(&Article{})
    db.AutoMigrate(&Comment{})
    db.AutoMigrate(&Tag{})

    // Add indexes for performance
    db.Model(&Article{}).AddIndex("idx_article_created_at", "created_at")
    db.Model(&Article{}).AddIndex("idx_article_slug", "slug")
    db.Model(&Comment{}).AddIndex("idx_comment_article_id", "article_id")
}
```

**Deliverable 6.1.1:** `performance-optimizations.md`

Document optimization:
- Performance improvement measured from the above change

### 6.2 Verify Optimizations

Re-run performance tests after optimizations:

**Deliverable 6.2.1:** `performance-improvement-report.md`

Compare before/after:
- Response times (p95, p99)
- Throughput (RPS)
- Error rates
- Resource utilization

Include:
- Side-by-side comparison tables
- Performance graphs
- Percentage improvements

---

## Part B: End-to-End Testing with Cypress

### Prerequisites
- Frontend running on `http://localhost:4100`
- Backend running on `http://localhost:8080`
- Cypress installed

---

## Task 7: Cypress Setup (10 points)

### 7.1 Install Cypress

```bash
cd react-redux-realworld-example-app

# Install Cypress
npm install --save-dev cypress

# Open Cypress for first time (creates folder structure)
npx cypress open
```

### 7.2 Configure Cypress

**Deliverable 7.2.1:** `cypress.config.js`

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4100',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    apiUrl: 'http://localhost:8080/api',
  },
});
```

### 7.3 Create Helper Commands

**Deliverable 7.3.1:** `cypress/support/commands.js`

```javascript
// Custom commands for common actions

Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users/login`,
    body: {
      user: { email, password }
    }
  }).then((response) => {
    window.localStorage.setItem('jwt', response.body.user.token);
  });
});

Cypress.Commands.add('register', (email, username, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users`,
    body: {
      user: { email, username, password }
    }
  }).then((response) => {
    window.localStorage.setItem('jwt', response.body.user.token);
  });
});

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('jwt');
});

Cypress.Commands.add('createArticle', (title, description, body, tags = []) => {
  const token = window.localStorage.getItem('jwt');
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/articles`,
    headers: {
      'Authorization': `Token ${token}`
    },
    body: {
      article: { title, description, body, tagList: tags }
    }
  });
});
```

### 7.4 Create Test Fixtures

**Deliverable 7.4.1:** `cypress/fixtures/users.json`

```json
{
  "testUser": {
    "email": "cypress-test@example.com",
    "username": "cypresstest",
    "password": "CypressTest123!"
  },
  "secondUser": {
    "email": "cypress-test2@example.com",
    "username": "cypresstest2",
    "password": "CypressTest123!"
  }
}
```

**Deliverable 7.4.2:** `cypress/fixtures/articles.json`

```json
{
  "sampleArticle": {
    "title": "Test Article for E2E Testing",
    "description": "This is a test article description",
    "body": "This is the body of the test article. It contains multiple paragraphs and demonstrates the article functionality.",
    "tagList": ["testing", "cypress", "e2e"]
  }
}
```

---

## Task 8: Authentication E2E Tests (30 points)

### 8.1 User Registration Tests

**Deliverable 8.1.1:** `cypress/e2e/auth/registration.cy.js`

```javascript
describe('User Registration', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display registration form', () => {
    cy.contains('Sign up').should('be.visible');
    cy.get('input[placeholder="Username"]').should('be.visible');
    cy.get('input[placeholder="Email"]').should('be.visible');
    cy.get('input[placeholder="Password"]').should('be.visible');
  });

  it('should successfully register a new user', () => {
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `testuser${timestamp}@example.com`;

    cy.get('input[placeholder="Username"]').type(username);
    cy.get('input[placeholder="Email"]').type(email);
    cy.get('input[placeholder="Password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Should redirect to home page
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // User should be logged in
    cy.contains(username).should('be.visible');
  });

  it('should show error for existing email', () => {
    cy.fixture('users').then((users) => {
      // Try to register with existing email
      cy.get('input[placeholder="Username"]').type('newusername');
      cy.get('input[placeholder="Email"]').type(users.testUser.email);
      cy.get('input[placeholder="Password"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      // Should show error
      cy.contains('email').should('be.visible');
    });
  });

  it('should validate required fields', () => {
    cy.get('button[type="submit"]').click();

    // Form should not submit and show validation
    cy.url().should('include', '/register');
  });

  it('should validate email format', () => {
    cy.get('input[placeholder="Username"]').type('testuser');
    cy.get('input[placeholder="Email"]').type('invalid-email');
    cy.get('input[placeholder="Password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Should show validation error
    cy.url().should('include', '/register');
  });
});
```

### 8.2 User Login Tests

**Deliverable 8.2.1:** `cypress/e2e/auth/login.cy.js`

```javascript
describe('User Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.contains('Sign in').should('be.visible');
    cy.get('input[placeholder="Email"]').should('be.visible');
    cy.get('input[placeholder="Password"]').should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    cy.fixture('users').then((users) => {
      cy.get('input[placeholder="Email"]').type(users.testUser.email);
      cy.get('input[placeholder="Password"]').type(users.testUser.password);
      cy.get('button[type="submit"]').click();

      // Should redirect to home
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);

      // Should show user's name in header
      cy.get('.nav-link').contains(users.testUser.username).should('be.visible');
    });
  });

  it('should show error for invalid credentials', () => {
    cy.get('input[placeholder="Email"]').type('wrong@example.com');
    cy.get('input[placeholder="Password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.contains('email or password').should('be.visible');

    // Should remain on login page
    cy.url().should('include', '/login');
  });

  it('should persist login after page refresh', () => {
    cy.fixture('users').then((users) => {
      cy.get('input[placeholder="Email"]').type(users.testUser.email);
      cy.get('input[placeholder="Password"]').type(users.testUser.password);
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', `${Cypress.config().baseUrl}/`);

      // Refresh page
      cy.reload();

      // User should still be logged in
      cy.get('.nav-link').contains(users.testUser.username).should('be.visible');
    });
  });

  it('should logout successfully', () => {
    cy.fixture('users').then((users) => {
      // Login first
      cy.login(users.testUser.email, users.testUser.password);
      cy.visit('/');

      // Click logout
      cy.contains('Settings').click();
      cy.contains('Or click here to logout').click();

      // Should redirect to home and show sign in link
      cy.contains('Sign in').should('be.visible');
    });
  });
});
```

---

## Task 9: Article Management E2E Tests (40 points)

### 9.1 Article Creation Tests

**Deliverable 9.1.1:** `cypress/e2e/articles/create-article.cy.js`

```javascript
describe('Article Creation', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
    });
    cy.visit('/editor');
  });

  it('should display article editor form', () => {
    cy.get('input[placeholder="Article Title"]').should('be.visible');
    cy.get('input[placeholder="What\'s this article about?"]').should('be.visible');
    cy.get('textarea[placeholder="Write your article (in markdown)"]').should('be.visible');
    cy.get('input[placeholder="Enter tags"]').should('be.visible');
  });

  it('should create a new article successfully', () => {
    const timestamp = Date.now();
    const title = `Test Article ${timestamp}`;

    cy.get('input[placeholder="Article Title"]').type(title);
    cy.get('input[placeholder="What\'s this article about?"]').type('Test Description');
    cy.get('textarea[placeholder="Write your article (in markdown)"]').type('# Test Content\n\nThis is test content.');
    cy.get('input[placeholder="Enter tags"]').type('test{enter}');
    cy.get('button[type="submit"]').contains('Publish Article').click();

    // Should redirect to article page
    cy.url().should('include', '/article/');

    // Article should be displayed
    cy.contains(title).should('be.visible');
    cy.contains('Test Description').should('be.visible');
    cy.contains('This is test content').should('be.visible');
    cy.contains('test').should('be.visible');
  });

  it('should add multiple tags', () => {
    cy.get('input[placeholder="Enter tags"]').type('tag1{enter}');
    cy.get('input[placeholder="Enter tags"]').type('tag2{enter}');
    cy.get('input[placeholder="Enter tags"]').type('tag3{enter}');

    cy.get('.tag-default').should('have.length', 3);
    cy.contains('tag1').should('be.visible');
    cy.contains('tag2').should('be.visible');
    cy.contains('tag3').should('be.visible');
  });

  it('should remove tags', () => {
    cy.get('input[placeholder="Enter tags"]').type('tag1{enter}');
    cy.get('input[placeholder="Enter tags"]').type('tag2{enter}');

    // Click X to remove tag
    cy.get('.tag-default').first().find('.tag-remove').click();

    cy.get('.tag-default').should('have.length', 1);
    cy.contains('tag2').should('be.visible');
  });

  it('should show validation for required fields', () => {
    cy.get('button[type="submit"]').click();

    // Should remain on editor page
    cy.url().should('include', '/editor');
  });
});
```

### 9.2 Article Reading Tests

**Deliverable 9.2.1:** `cypress/e2e/articles/read-article.cy.js`

```javascript
describe('Article Reading', () => {
  let articleSlug;

  before(() => {
    // Create an article to test with
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
    });

    cy.fixture('articles').then((articles) => {
      cy.createArticle(
        articles.sampleArticle.title,
        articles.sampleArticle.description,
        articles.sampleArticle.body,
        articles.sampleArticle.tagList
      ).then((response) => {
        articleSlug = response.body.article.slug;
      });
    });
  });

  beforeEach(() => {
    cy.visit(`/article/${articleSlug}`);
  });

  it('should display article content', () => {
    cy.fixture('articles').then((articles) => {
      cy.contains(articles.sampleArticle.title).should('be.visible');
      cy.contains(articles.sampleArticle.description).should('be.visible');
      cy.contains(articles.sampleArticle.body).should('be.visible');
    });
  });

  it('should display article metadata', () => {
    cy.fixture('users').then((users) => {
      // Author name
      cy.contains(users.testUser.username).should('be.visible');

      // Date
      cy.get('.date').should('be.visible');

      // Tags
      cy.get('.tag-default').should('have.length.at.least', 1);
    });
  });

  it('should allow favoriting article', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
      cy.visit(`/article/${articleSlug}`);
    });

    // Click favorite button
    cy.get('.btn-outline-primary').contains('Favorite').click();

    // Button should change
    cy.get('.btn-primary').contains('Unfavorite').should('be.visible');
  });

  it('should allow unfavoriting article', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
      cy.visit(`/article/${articleSlug}`);
    });

    // Favorite first
    cy.get('.btn-outline-primary').contains('Favorite').click();

    // Then unfavorite
    cy.get('.btn-primary').contains('Unfavorite').click();

    // Button should change back
    cy.get('.btn-outline-primary').contains('Favorite').should('be.visible');
  });
});
```

### 9.3 Article Update/Delete Tests

**Deliverable 9.3.1:** `cypress/e2e/articles/edit-article.cy.js`

```javascript
describe('Article Editing', () => {
  let articleSlug;

  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
    });

    // Create article for each test
    const timestamp = Date.now();
    cy.createArticle(
      `Editable Article ${timestamp}`,
      'Description to edit',
      'Body to edit',
      ['edit', 'test']
    ).then((response) => {
      articleSlug = response.body.article.slug;
      cy.visit(`/article/${articleSlug}`);
    });
  });

  it('should show edit button for own article', () => {
    cy.contains('Edit Article').should('be.visible');
  });

  it('should navigate to editor when clicking edit', () => {
    cy.contains('Edit Article').click();
    cy.url().should('include', '/editor/');
  });

  it('should pre-populate editor with article data', () => {
    cy.contains('Edit Article').click();

    cy.get('input[placeholder="Article Title"]').should('have.value', `Editable Article`);
    cy.get('input[placeholder="What\'s this article about?"]').should('have.value', 'Description to edit');
    cy.get('textarea').should('contain.value', 'Body to edit');
  });

  it('should successfully update article', () => {
    cy.contains('Edit Article').click();

    // Modify content
    cy.get('input[placeholder="Article Title"]').clear().type('Updated Title');
    cy.get('textarea').clear().type('Updated body content');
    cy.get('button[type="submit"]').click();

    // Should show updated content
    cy.contains('Updated Title').should('be.visible');
    cy.contains('Updated body content').should('be.visible');
  });

  it('should successfully delete article', () => {
    cy.contains('Delete Article').click();

    // Should redirect to home
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // Article should not appear in list
    cy.visit('/');
    cy.contains(`Editable Article`).should('not.exist');
  });

  it('should not show edit/delete buttons for other users articles', () => {
    // Logout and login as different user
    cy.logout();
    cy.fixture('users').then((users) => {
      cy.login(users.secondUser.email, users.secondUser.password);
    });

    cy.visit(`/article/${articleSlug}`);

    cy.contains('Edit Article').should('not.exist');
    cy.contains('Delete Article').should('not.exist');
  });
});
```

---

## Task 10: Comments E2E Tests (25 points)

**Deliverable 10.1:** `cypress/e2e/articles/comments.cy.js`

```javascript
describe('Article Comments', () => {
  let articleSlug;

  before(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
    });

    cy.createArticle(
      'Article with Comments',
      'Testing comments',
      'Comment testing article',
      ['comments']
    ).then((response) => {
      articleSlug = response.body.article.slug;
    });
  });

  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
    });
    cy.visit(`/article/${articleSlug}`);
  });

  it('should display comment form when logged in', () => {
    cy.get('textarea[placeholder="Write a comment..."]').should('be.visible');
    cy.contains('Post Comment').should('be.visible');
  });

  it('should add a comment successfully', () => {
    const commentText = `Test comment ${Date.now()}`;

    cy.get('textarea[placeholder="Write a comment..."]').type(commentText);
    cy.contains('Post Comment').click();

    // Comment should appear
    cy.contains(commentText).should('be.visible');
  });

  it('should display multiple comments', () => {
    cy.get('textarea').type('Comment 1{enter}');
    cy.contains('Post Comment').click();
    cy.wait(500);

    cy.get('textarea').type('Comment 2{enter}');
    cy.contains('Post Comment').click();

    cy.get('.card').should('have.length.at.least', 2);
  });

  it('should delete own comment', () => {
    const commentText = `Comment to delete ${Date.now()}`;

    cy.get('textarea').type(commentText);
    cy.contains('Post Comment').click();

    // Find and click delete button for this comment
    cy.contains(commentText).parent().parent().find('.mod-options').click();

    // Comment should be removed
    cy.contains(commentText).should('not.exist');
  });

  it('should not show delete button for others comments', () => {
    // Add comment as first user
    const commentText = `Other user comment ${Date.now()}`;
    cy.get('textarea').type(commentText);
    cy.contains('Post Comment').click();

    // Logout and login as different user
    cy.logout();
    cy.fixture('users').then((users) => {
      cy.login(users.secondUser.email, users.secondUser.password);
    });
    cy.visit(`/article/${articleSlug}`);

    // Should not see delete button for first user's comment
    cy.contains(commentText).parent().parent().find('.mod-options').should('not.exist');
  });
});
```

---

## Task 11: User Profile & Feed E2E Tests (25 points)

**Deliverable 11.1:** `cypress/e2e/profile/user-profile.cy.js`

```javascript
describe('User Profile', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
    });
  });

  it('should view own profile', () => {
    cy.fixture('users').then((users) => {
      cy.visit(`/@${users.testUser.username}`);

      cy.contains(users.testUser.username).should('be.visible');
      cy.contains('Edit Profile Settings').should('be.visible');
    });
  });

  it('should display user articles', () => {
    cy.fixture('users').then((users) => {
      // Create an article first
      cy.createArticle('Profile Article', 'Description', 'Body', ['profile']);

      cy.visit(`/@${users.testUser.username}`);

      cy.contains('My Articles').click();
      cy.contains('Profile Article').should('be.visible');
    });
  });

  it('should display favorited articles', () => {
    cy.fixture('users').then((users) => {
      cy.visit(`/@${users.testUser.username}`);

      cy.contains('Favorited Articles').click();
      // Should show favorited articles tab
      cy.url().should('include', 'favorites');
    });
  });

  it('should follow another user', () => {
    cy.fixture('users').then((users) => {
      // Visit another user's profile
      cy.visit(`/@${users.secondUser.username}`);

      // Click follow button
      cy.contains('Follow').click();

      // Button should change
      cy.contains('Unfollow').should('be.visible');
    });
  });

  it('should update profile settings', () => {
    cy.contains('Settings').click();

    cy.get('input[placeholder="URL of profile picture"]').clear().type('https://example.com/avatar.jpg');
    cy.get('textarea[placeholder="Short bio about you"]').clear().type('Updated bio');
    cy.contains('Update Settings').click();

    // Should redirect to profile
    cy.fixture('users').then((users) => {
      cy.url().should('include', `/@${users.testUser.username}`);
      cy.contains('Updated bio').should('be.visible');
    });
  });
});
```

**Deliverable 11.2:** `cypress/e2e/feed/article-feed.cy.js`

```javascript
describe('Article Feed', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display global feed', () => {
    cy.contains('Global Feed').should('be.visible');
    cy.get('.article-preview').should('have.length.at.least', 1);
  });

  it('should display popular tags', () => {
    cy.get('.sidebar').should('be.visible');
    cy.contains('Popular Tags').should('be.visible');
    cy.get('.tag-pill').should('have.length.at.least', 1);
  });

  it('should filter by tag', () => {
    // Click a tag
    cy.get('.tag-pill').first().click();

    // Should show filtered articles
    cy.get('.nav-link.active').should('contain.text', '#');
  });

  it('should show your feed when logged in', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
    });
    cy.visit('/');

    cy.contains('Your Feed').should('be.visible');
    cy.contains('Your Feed').click();

    // Should show personal feed
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });

  it('should paginate articles', () => {
    // If there are more than 10 articles
    cy.get('.article-preview').then(($articles) => {
      if ($articles.length === 10) {
        // Check for pagination
        cy.get('.pagination').should('be.visible');

        // Click next page
        cy.get('.page-link').contains('2').click();

        // Should load different articles
        cy.url().should('include', '?page=2');
      }
    });
  });
});
```

---

## Task 12: Complete User Workflows (30 points)

**Deliverable 12.1:** `cypress/e2e/workflows/complete-user-journey.cy.js`

Test complete user workflows:

```javascript
describe('Complete User Journeys', () => {
  it('should complete new user registration and article creation flow', () => {
    const timestamp = Date.now();
    const username = `newuser${timestamp}`;
    const email = `newuser${timestamp}@example.com`;

    // 1. Register
    cy.visit('/register');
    cy.get('input[placeholder="Username"]').type(username);
    cy.get('input[placeholder="Email"]').type(email);
    cy.get('input[placeholder="Password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // 2. Should be logged in
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // 3. Navigate to editor
    cy.contains('New Article').click();

    // 4. Create article
    cy.get('input[placeholder="Article Title"]').type('My First Article');
    cy.get('input[placeholder="What\'s this article about?"]').type('Learning Cypress');
    cy.get('textarea').type('This is my first article!');
    cy.get('input[placeholder="Enter tags"]').type('first{enter}');
    cy.get('button[type="submit"]').click();

    // 5. Article should be published
    cy.contains('My First Article').should('be.visible');

    // 6. Go to profile
    cy.get('.nav-link').contains(username).click();

    // 7. Article should appear in profile
    cy.contains('My First Article').should('be.visible');
  });

  it('should complete article interaction flow', () => {
    cy.fixture('users').then((users) => {
      // Login
      cy.login(users.testUser.email, users.testUser.password);
      cy.visit('/');

      // Find an article
      cy.get('.article-preview').first().click();

      // Favorite the article
      cy.get('.btn-outline-primary').contains('Favorite').click();

      // Add a comment
      const comment = `Great article! ${Date.now()}`;
      cy.get('textarea[placeholder="Write a comment..."]').type(comment);
      cy.contains('Post Comment').click();

      // Comment should appear
      cy.contains(comment).should('be.visible');

      // View author profile
      cy.get('.author').first().click();

      // Should be on author's profile
      cy.url().should('include', '/@');
    });
  });

  it('should complete settings update flow', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
      cy.visit('/');

      // Go to settings
      cy.contains('Settings').click();

      // Update profile
      cy.get('textarea[placeholder="Short bio about you"]').clear().type('E2E Testing Expert');
      cy.contains('Update Settings').click();

      // Should redirect to profile
      cy.url().should('include', '/@');
      cy.contains('E2E Testing Expert').should('be.visible');
    });
  });
});
```

---

## Task 13: Cross-Browser Testing (20 points)

**Deliverable 13.1:** Run tests in multiple browsers

```bash
# Chrome (default)
npx cypress run

# Firefox
npx cypress run --browser firefox

# Edge
npx cypress run --browser edge

# Electron
npx cypress run --browser electron
```

**Deliverable 13.2:** `cross-browser-testing-report.md`

Document:
- Test results per browser
- Browser-specific issues found
- Compatibility matrix
- Screenshots of any browser-specific failures

---

## Submission Requirements

### What to Submit

#### Part A: k6 Performance Testing

1. **Test Scripts:**
   - All k6 test files (`.js`)
   - Helper functions and configurations

2. **Test Results:**
   - JSON output files from all tests
   - `k6-load-test-analysis.md`
   - `k6-stress-test-analysis.md`
   - `k6-spike-test-analysis.md`
   - `k6-soak-test-analysis.md`
   - `performance-optimizations.md`
   - `performance-improvement-report.md`

3. **Screenshots/Evidence:**
   - k6 terminal outputs
   - Server monitoring screenshots
   - Performance graphs

#### Part B: Cypress E2E Testing

1. **Test Files:**
   - All Cypress test files (`*.cy.js`)
   - Configuration files
   - Custom commands
   - Fixtures

2. **Test Results:**
   - Test execution videos
   - Screenshots of failures
   - `cross-browser-testing-report.md`

3. **Documentation:**
   - `ASSIGNMENT_3_REPORT.md` summarizing:
     - Performance baseline established
     - Bottlenecks identified
     - Optimizations implemented
     - E2E test coverage
     - Browser compatibility findings
     - Key learnings

### Grading Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| k6 Setup | 3 | Proper configuration, helpers implemented |
| Load Testing | 10 | Comprehensive test, thorough analysis |
| Stress Testing | 8 | Breaking point identified, recovery analyzed |
| Spike Testing | 5 | Sudden load handled, analysis complete |
| Soak Testing | 8 | Long-duration test, leak detection |
| Performance Optimization | 8 | Meaningful optimizations, verified improvements |
| Cypress Setup | 3 | Proper configuration, custom commands |
| Authentication Tests | 10 | Complete auth flows tested |
| Article Management Tests | 12 | CRUD operations fully tested |
| Comments Tests | 8 | Comment functionality verified |
| Profile & Feed Tests | 8 | User interactions tested |
| Complete Workflows | 10 | End-to-end user journeys |
| Cross-Browser Testing | 5 | Multiple browsers tested, issues documented |
| Documentation | 2 | Clear analysis and reporting |
| **Total** | **100** | |

### Tips for Success

1. **Performance Testing:**
   - Start with lower VU counts
   - Monitor server resources during tests
   - Run tests during off-peak hours
   - Document environmental factors

2. **E2E Testing:**
   - Use fixtures and custom commands
   - Keep tests independent
   - Use proper waits (not hard-coded delays)
   - Clean up test data
   - Use descriptive test names

3. **General:**
   - Run tests frequently during development
   - Don't wait until the end
   - Document issues as you find them
   - Take screenshots for evidence

### Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Web Performance Metrics](https://web.dev/metrics/)

### Deadline
November 30, 2025, 11:59 PM

