# Assignment 1: Unit Testing, Integration Testing & Test Coverage

## Overview
In this assignment, you will implement comprehensive unit tests, integration tests, and analyze test coverage for the RealWorld application (both backend and frontend).

## Learning Objectives
- Write  unit tests for isolated components
- Implement integration tests for API endpoints and component interactions
- Measure and improve test coverage
- Understand testing best practices in Go and JavaScript/React

---

## Part A: Backend Testing (Go/Gin)

### Prerequisites
- Go installed (1.16+)
- Familiarity with Go testing framework
- Backend server running on `http://localhost:8080`

### Task 1: Unit Testing (40 points)

#### 1.1 Analyze Existing Tests
Examine the existing test files:
```bash
cd golang-gin-realworld-example-app
go test ./... -v
```

**Deliverable:**
- Document which packages have tests and which don't
- Identify any failing tests and explain why they fail
- Create a markdown file `testing-analysis.md` with your findings

#### 1.2 Write Unit Tests for Articles Package
The `articles/` package currently has **no test coverage**. Create `articles/unit_test.go` with tests for:

**Required Test Cases:**
1. **Model Tests**
   - Test article creation with valid data
   - Test article validation (empty title, body, etc.)
   - Test favorite/unfavorite functionality
   - Test tag association

2. **Serializer Tests**
   - Test `ArticleSerializer` output format
   - Test `ArticleListSerializer` with multiple articles
   - Test `CommentSerializer` structure

3. **Validator Tests**
   - Test `ArticleModelValidator` with valid input
   - Test validation errors for missing required fields
   - Test `CommentModelValidator`

**Example Test Structure:**
```go
func TestArticleModel(t *testing.T) {
    // Setup test database
    // Create test article
    // Assert expected behavior
}
```

**Deliverable:**
- `articles/unit_test.go` with minimum 15 test cases
- All tests must pass: `go test ./articles -v`

#### 1.3 Write Unit Tests for Common Package
Enhance `common/unit_test.go` with additional tests:

**Required Test Cases:**
1. Test JWT token generation with different user IDs
2. Test JWT token expiration
3. Test database connection error handling
4. Test utility functions (if any)

**Deliverable:**
- Enhanced `common/unit_test.go` with at least 5 additional test cases

### Task 2: Integration Testing (30 points)

Create `integration_test.go` in the root of `golang-gin-realworld-example-app/` to test API endpoints.

#### 2.1 Authentication Integration Tests
Test the complete authentication flow:

**Required Test Cases:**
1. **User Registration**
   - POST `/api/users` with valid data
   - Verify response contains user object and token
   - Verify user is saved in database

2. **User Login**
   - POST `/api/users/login` with valid credentials
   - Verify JWT token is returned
   - Test login with invalid credentials

3. **Get Current User**
   - GET `/api/user` with valid token
   - Verify authenticated user data is returned
   - Test with invalid/missing token (should return 401)

**Example Test Structure:**
```go
func TestUserRegistrationFlow(t *testing.T) {
    // Setup test server
    router := gin.Default()
    // Register routes
    // Make HTTP request
    w := httptest.NewRecorder()
    req, _ := http.NewRequest("POST", "/api/users", body)
    router.ServeHTTP(w, req)
    // Assert response
    assert.Equal(t, 200, w.Code)
}
```

#### 2.2 Article CRUD Integration Tests

**Required Test Cases:**
1. **Create Article**
   - POST `/api/articles` with authentication
   - Verify article is created and returned
   - Test without authentication (should fail)

2. **List Articles**
   - GET `/api/articles`
   - Verify articles are returned with correct format
   - Test pagination and filtering

3. **Get Single Article**
   - GET `/api/articles/:slug`
   - Verify article details are correct

4. **Update Article**
   - PUT `/api/articles/:slug` with authentication
   - Verify only author can update
   - Test unauthorized update attempt

5. **Delete Article**
   - DELETE `/api/articles/:slug` with authentication
   - Verify article is removed
   - Test unauthorized delete attempt

#### 2.3 Article Interaction Tests

**Required Test Cases:**
1. **Favorite/Unfavorite Article**
   - POST `/api/articles/:slug/favorite`
   - DELETE `/api/articles/:slug/favorite`
   - Verify favorite count updates

2. **Comments**
   - POST `/api/articles/:slug/comments` - Create comment
   - GET `/api/articles/:slug/comments` - List comments
   - DELETE `/api/articles/:slug/comments/:id` - Delete comment

**Deliverable:**
- `integration_test.go` with minimum 15 integration test cases
- All tests must pass: `go test -v integration_test.go`

### Task 3: Test Coverage Analysis (30 points)

#### 3.1 Generate Coverage Reports
```bash
# Run tests with coverage
go test ./... -cover

# Generate detailed coverage report
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

#### 3.2 Coverage Requirements

**Required Coverage Levels:**
- `common/` package: minimum 70% coverage
- `users/` package: minimum 70% coverage
- `articles/` package: minimum 70% coverage
- Overall project: minimum 70% coverage

#### 3.3 Coverage Analysis Report

Create `coverage-report.md` with:

1. **Current Coverage Statistics**
   - Coverage percentage per package
   - Overall project coverage
   - Screenshots of `coverage.html`

2. **Identified Gaps**
   - Which functions/methods lack coverage
   - Why certain code is not covered
   - Which code is critical to test

3. **Improvement Plan**
   - Additional tests to write to reach 80% coverage
   - Test cases that would add most value

**Deliverable:**
- `coverage.out` file
- `coverage.html` file
- `coverage-report.md` analysis document

---

## Part B: Frontend Testing (React/Redux)

### Prerequisites
- Node.js and npm installed
- Frontend running on `http://localhost:4100`
- Familiarity with Jest and React Testing Library

### Task 4: Component Unit Tests (40 points)

#### 4.1 Analyze Existing Tests
```bash
cd react-redux-realworld-example-app
npm test
```

**Deliverable:**
- Document existing test coverage
- List components that lack tests

#### 4.2 Write Component Tests

Create test files for the following components:

**Required Test Cases:**

1. **Article List Component** (`src/components/ArticleList.test.js`)
   - Test rendering with empty articles array
   - Test rendering with multiple articles
   - Test loading state
   - Test article click navigation

2. **Article Preview Component** (`src/components/ArticlePreview.test.js`)
   - Test article data rendering (title, description, author)
   - Test favorite button functionality
   - Test tag list rendering
   - Test author link navigation

3. **Login Component** (`src/components/Login.test.js`)
   - Test form rendering
   - Test input field updates
   - Test form submission
   - Test error message display
   - Test redirect after successful login

4. **Header Component** (`src/components/Header.test.js`)
   - Test navigation links for logged-in user
   - Test navigation links for guest user
   - Test active link highlighting

5. **Article Form Component** (`src/components/Editor.test.js`)
   - Test form field rendering
   - Test tag input functionality
   - Test form submission
   - Test validation errors

**Example Test Structure:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ArticleList from './ArticleList';

test('renders article list with articles', () => {
  const mockArticles = [/* mock data */];
  render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <ArticleList articles={mockArticles} />
      </BrowserRouter>
    </Provider>
  );
  expect(screen.getByText('Test Article')).toBeInTheDocument();
});
```

**Deliverable:**
- Minimum 5 component test files
- Minimum 20 test cases total
- All tests pass: `npm test`

### Task 5: Redux Integration Tests (30 points)

#### 5.1 Action Creator Tests

Create `src/actions.test.js`:

**Required Test Cases:**
1. Test action creators return correct action types
2. Test action creators include correct payloads
3. Test async actions (LOGIN, REGISTER, etc.)

#### 5.2 Reducer Tests

Create test files for reducers:

**Required Test Cases:**

1. **Auth Reducer** (`src/reducers/auth.test.js`)
   - Test LOGIN action updates token and user
   - Test LOGOUT action clears state
   - Test REGISTER action
   - Test authentication error handling

2. **Article List Reducer** (`src/reducers/articleList.test.js`)
   - Test ARTICLE_PAGE_LOADED updates articles
   - Test pagination state updates
   - Test filter changes

3. **Editor Reducer** (`src/reducers/editor.test.js`)
   - Test UPDATE_FIELD_EDITOR updates form fields
   - Test EDITOR_PAGE_LOADED for new vs edit
   - Test tag management

**Example Test Structure:**
```javascript
import authReducer from './auth';
import { LOGIN, LOGOUT } from '../constants/actionTypes';

describe('auth reducer', () => {
  it('should handle LOGIN', () => {
    const action = {
      type: LOGIN,
      payload: { user: { email: 'test@test.com', token: 'jwt-token' } }
    };
    const newState = authReducer(undefined, action);
    expect(newState.token).toBe('jwt-token');
    expect(newState.user.email).toBe('test@test.com');
  });
});
```

#### 5.3 Middleware Tests

Create `src/middleware.test.js`:

**Required Test Cases:**
1. Test promise middleware unwraps promises
2. Test localStorage middleware saves token
3. Test viewChangeCounter increments on page unload
4. Test request cancellation for outdated requests

**Deliverable:**
- Minimum 3 reducer test files
- `actions.test.js` with action tests
- `middleware.test.js` with middleware tests
- All tests pass

### Task 6: Frontend Integration Tests (30 points)

Create `src/integration.test.js` to test component + Redux integration:

**Required Test Cases:**

1. **Login Flow**
   - Render login form
   - Enter credentials
   - Submit form
   - Verify Redux state updates
   - Verify localStorage contains token
   - Verify redirect to home page

2. **Article Creation Flow**
   - User must be logged in
   - Navigate to editor
   - Fill article form
   - Submit
   - Verify article appears in list

3. **Article Favorite Flow**
   - Click favorite button
   - Verify API call made
   - Verify Redux state updates
   - Verify UI updates (button style, count)

**Example Test Structure:**
```javascript
import { renderWithProviders } from './test-utils';
import App from './App';
import { fireEvent, waitFor } from '@testing-library/react';

test('complete login flow', async () => {
  const { getByLabelText, getByText } = renderWithProviders(<App />);

  fireEvent.change(getByLabelText('Email'), { target: { value: 'test@test.com' } });
  fireEvent.change(getByLabelText('Password'), { target: { value: 'password' } });
  fireEvent.click(getByText('Sign in'));

  await waitFor(() => {
    expect(localStorage.getItem('jwt')).toBeTruthy();
  });
});
```

**Deliverable:**
- `integration.test.js` with minimum 5 integration tests
- All tests pass

---

## Submission Requirements

### What to Submit

1. **Backend Code:**
   - All test files (`*_test.go`)
   - `coverage.out` and `coverage.html`
   - `testing-analysis.md`
   - `coverage-report.md`

2. **Frontend Code:**
   - All test files (`*.test.js`)
   - Updated `package.json` if new dependencies added

3. **Test Execution Proof:**
   - Screenshots showing all tests passing
   - Screenshot of coverage reports

4. **Documentation:**
   - `ASSIGNMENT_1_REPORT.md` summarizing:
     - Your testing approach
     - List of tests cases implemented/written
     - Coverage achieved
   - 
### Grading Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| Backend Unit Tests | 15 | Comprehensive test cases, all passing, good coverage |
| Backend Integration Tests | 15 | API flows tested end-to-end, authentication handled |
| Backend Test Coverage | 15 | Minimum coverage met, analysis report complete |
| Frontend Component Tests | 15 | Components tested in isolation, mocks used appropriately |
| Frontend Redux Tests | 15 | Reducers, actions, middleware tested |
| Frontend Integration Tests | 15 | User flows tested with Redux integration |
| Documentation | 5 | Clear analysis, proper documentation |
| Code Quality | 5 | Clean code, meaningful test names, follows conventions |
| **Total** | **100** | |

### Tips

1. **Start with Simple Tests:** Write basic tests first, then add complexity
2. **Use Test Fixtures:** Create reusable mock data
3. **Test Edge Cases:** Don't just test happy paths
4. **Read Existing Tests:** Learn from `common/unit_test.go` and `users/unit_test.go`
5. **Use Descriptive Names:** Test names should explain what they test
6. **Mock External Dependencies:** Don't rely on actual database in unit tests
7. **Run Tests Frequently:** Don't wait until the end to run all tests

### Resources

- [Go Testing Package](https://golang.org/pkg/testing/)
- [Go Test Coverage](https://blog.golang.org/cover)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Redux Testing Guide](https://redux.js.org/usage/writing-tests)

### Deadline
November 30, 2025, 11:59 PM

