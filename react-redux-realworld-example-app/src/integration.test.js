import configureMockStore from 'redux-mock-store';
import { promiseMiddleware, localStorageMiddleware } from './middleware';
import {
  LOGIN,
  REGISTER,
  LOGOUT,
  UPDATE_FIELD_AUTH,
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  UPDATE_FIELD_EDITOR,
  ARTICLE_SUBMITTED,
  ASYNC_START
} from './constants/actionTypes';

const middlewares = [promiseMiddleware, localStorageMiddleware];
const mockStore = configureMockStore(middlewares);

describe('Integration Tests - Redux Flow', () => {
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
  });

  describe('Login Flow Integration', () => {
    test('complete login flow with successful authentication', async () => {
      const store = mockStore({
        auth: { email: '', password: '', inProgress: false },
        viewChangeCounter: 0
      });

      // Step 1: User updates email field
      store.dispatch({
        type: UPDATE_FIELD_AUTH,
        key: 'email',
        value: 'test@example.com'
      });

      // Step 2: User updates password field
      store.dispatch({
        type: UPDATE_FIELD_AUTH,
        key: 'password',
        value: 'password123'
      });

      // Step 3: User submits login form
      const loginResponse = { user: { email: 'test@example.com', token: 'jwt-token-123' } };
      store.dispatch({
        type: LOGIN,
        payload: loginResponse,
        error: false
      });

      const actions = store.getActions();

      // Verify form field updates
      expect(actions[0]).toEqual({
        type: UPDATE_FIELD_AUTH,
        key: 'email',
        value: 'test@example.com'
      });

      expect(actions[1]).toEqual({
        type: UPDATE_FIELD_AUTH,
        key: 'password',
        value: 'password123'
      });

      // Verify login action
      expect(actions[2].type).toBe(LOGIN);

      // Verify token saved to localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', 'jwt-token-123');
    });

    test('login flow with authentication error', () => {
      const store = mockStore({
        auth: { email: '', password: '', inProgress: false },
        viewChangeCounter: 0
      });

      // User attempts login with invalid credentials
      store.dispatch({
        type: LOGIN,
        payload: { errors: { 'email or password': ['is invalid'] } },
        error: true
      });

      const actions = store.getActions();

      // Verify error action dispatched
      expect(actions[0].type).toBe(LOGIN);
      expect(actions[0].error).toBe(true);

      // Verify token NOT saved to localStorage
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Registration Flow Integration', () => {
    test('complete registration flow with success', () => {
      const store = mockStore({
        auth: { email: '', username: '', password: '', inProgress: false },
        viewChangeCounter: 0
      });

      // Step 1: User fills registration form
      store.dispatch({
        type: UPDATE_FIELD_AUTH,
        key: 'username',
        value: 'newuser'
      });

      store.dispatch({
        type: UPDATE_FIELD_AUTH,
        key: 'email',
        value: 'newuser@example.com'
      });

      store.dispatch({
        type: UPDATE_FIELD_AUTH,
        key: 'password',
        value: 'password123'
      });

      // Step 2: User submits registration
      const registerResponse = {
        user: {
          username: 'newuser',
          email: 'newuser@example.com',
          token: 'new-jwt-token'
        }
      };

      store.dispatch({
        type: REGISTER,
        payload: registerResponse,
        error: false
      });

      const actions = store.getActions();

      // Verify all field updates
      expect(actions[0].key).toBe('username');
      expect(actions[1].key).toBe('email');
      expect(actions[2].key).toBe('password');

      // Verify registration action
      expect(actions[3].type).toBe(REGISTER);

      // Verify token saved to localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', 'new-jwt-token');
    });

    test('registration flow with validation errors', () => {
      const store = mockStore({
        auth: { email: '', username: '', password: '' },
        viewChangeCounter: 0
      });

      // User submits registration with errors
      store.dispatch({
        type: REGISTER,
        payload: {
          errors: {
            email: ['has already been taken'],
            username: ['has already been taken']
          }
        },
        error: true
      });

      const actions = store.getActions();

      // Verify error action
      expect(actions[0].type).toBe(REGISTER);
      expect(actions[0].error).toBe(true);
      expect(actions[0].payload.errors.email).toEqual(['has already been taken']);
    });
  });

  describe('Article Favorite Flow Integration', () => {
    test('favorite an article updates state correctly', () => {
      const store = mockStore({
        articleList: {
          articles: [
            { slug: 'test-article', favorited: false, favoritesCount: 5 }
          ]
        },
        viewChangeCounter: 0
      });

      // User clicks favorite button
      store.dispatch({
        type: ARTICLE_FAVORITED,
        payload: {
          article: {
            slug: 'test-article',
            favorited: true,
            favoritesCount: 6
          }
        }
      });

      const actions = store.getActions();

      // Verify favorite action dispatched
      expect(actions[0].type).toBe(ARTICLE_FAVORITED);
      expect(actions[0].payload.article.favorited).toBe(true);
      expect(actions[0].payload.article.favoritesCount).toBe(6);
    });

    test('unfavorite an article updates state correctly', () => {
      const store = mockStore({
        articleList: {
          articles: [
            { slug: 'test-article', favorited: true, favoritesCount: 6 }
          ]
        },
        viewChangeCounter: 0
      });

      // User clicks unfavorite button
      store.dispatch({
        type: ARTICLE_UNFAVORITED,
        payload: {
          article: {
            slug: 'test-article',
            favorited: false,
            favoritesCount: 5
          }
        }
      });

      const actions = store.getActions();

      // Verify unfavorite action dispatched
      expect(actions[0].type).toBe(ARTICLE_UNFAVORITED);
      expect(actions[0].payload.article.favorited).toBe(false);
      expect(actions[0].payload.article.favoritesCount).toBe(5);
    });
  });

  describe('Article Creation Flow Integration', () => {
    test('complete article creation flow', () => {
      const store = mockStore({
        editor: {
          title: '',
          description: '',
          body: '',
          tagList: []
        },
        viewChangeCounter: 0
      });

      // Step 1: User fills article form
      store.dispatch({
        type: UPDATE_FIELD_EDITOR,
        key: 'title',
        value: 'New Article Title'
      });

      store.dispatch({
        type: UPDATE_FIELD_EDITOR,
        key: 'description',
        value: 'Article description'
      });

      store.dispatch({
        type: UPDATE_FIELD_EDITOR,
        key: 'body',
        value: 'Article body content'
      });

      // Step 2: User submits article
      store.dispatch({
        type: ARTICLE_SUBMITTED,
        payload: {
          article: {
            slug: 'new-article-title',
            title: 'New Article Title',
            description: 'Article description',
            body: 'Article body content'
          }
        },
        error: false
      });

      const actions = store.getActions();

      // Verify form updates
      expect(actions[0].type).toBe(UPDATE_FIELD_EDITOR);
      expect(actions[0].key).toBe('title');

      expect(actions[1].type).toBe(UPDATE_FIELD_EDITOR);
      expect(actions[1].key).toBe('description');

      expect(actions[2].type).toBe(UPDATE_FIELD_EDITOR);
      expect(actions[2].key).toBe('body');

      // Verify article submission
      expect(actions[3].type).toBe(ARTICLE_SUBMITTED);
      expect(actions[3].payload.article.slug).toBe('new-article-title');
    });
  });

  describe('Logout Flow Integration', () => {
    test('complete logout flow clears authentication', () => {
      const store = mockStore({
        common: { token: 'jwt-token', currentUser: { username: 'testuser' } },
        viewChangeCounter: 0
      });

      // User clicks logout
      store.dispatch({ type: LOGOUT });

      const actions = store.getActions();

      // Verify logout action
      expect(actions[0].type).toBe(LOGOUT);

      // Verify token cleared from localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', '');
    });
  });
});
