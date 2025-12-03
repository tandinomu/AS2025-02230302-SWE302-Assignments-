import { promiseMiddleware, localStorageMiddleware } from './middleware';
import { LOGIN, REGISTER, LOGOUT, ASYNC_START, ASYNC_END } from './constants/actionTypes';

describe('Middleware Tests', () => {
  describe('Promise Middleware', () => {
    let store, next, action;

    beforeEach(() => {
      store = {
        getState: jest.fn(() => ({ viewChangeCounter: 0 })),
        dispatch: jest.fn()
      };
      next = jest.fn();
    });

    test('passes non-promise actions to next middleware', () => {
      action = { type: 'TEST_ACTION', payload: 'test' };

      promiseMiddleware(store)(next)(action);

      expect(next).toHaveBeenCalledWith(action);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    test('dispatches ASYNC_START when promise action is received', () => {
      action = {
        type: LOGIN,
        payload: Promise.resolve({ user: { token: 'test-token' } })
      };

      promiseMiddleware(store)(next)(action);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: ASYNC_START,
        subtype: LOGIN
      });
    });

    test('dispatches ASYNC_END and original action on promise success', async () => {
      const resolvedData = { user: { email: 'test@test.com', token: 'jwt-token' } };
      action = {
        type: LOGIN,
        payload: Promise.resolve(resolvedData)
      };

      promiseMiddleware(store)(next)(action);

      // Wait for promise to resolve
      await action.payload;
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: ASYNC_END })
      );
    });

    test('handles promise rejection correctly', async () => {
      const error = { response: { body: { errors: { message: 'Error occurred' } } } };
      action = {
        type: LOGIN,
        payload: Promise.reject(error)
      };

      promiseMiddleware(store)(next)(action);

      // Wait for promise to reject
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: ASYNC_END })
      );
    });

    test('cancels outdated requests when viewChangeCounter changes', async () => {
      store.getState = jest.fn()
        .mockReturnValueOnce({ viewChangeCounter: 0 })
        .mockReturnValueOnce({ viewChangeCounter: 1 });

      action = {
        type: LOGIN,
        payload: Promise.resolve({ user: { token: 'test' } })
      };

      promiseMiddleware(store)(next)(action);

      await action.payload;
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should not dispatch action when view has changed
      const dispatchCalls = store.dispatch.mock.calls;
      const actionDispatches = dispatchCalls.filter(call => call[0].type === LOGIN);
      expect(actionDispatches.length).toBe(0);
    });
  });

  describe('LocalStorage Middleware', () => {
    let store, next;

    beforeEach(() => {
      store = { getState: jest.fn(), dispatch: jest.fn() };
      next = jest.fn();
      // Mock localStorage
      global.localStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn()
      };
    });

    test('saves token to localStorage on LOGIN success', () => {
      const action = {
        type: LOGIN,
        payload: { user: { email: 'test@test.com', token: 'jwt-token-123' } },
        error: false
      };

      localStorageMiddleware(store)(next)(action);

      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', 'jwt-token-123');
      expect(next).toHaveBeenCalledWith(action);
    });

    test('saves token to localStorage on REGISTER success', () => {
      const action = {
        type: REGISTER,
        payload: { user: { username: 'newuser', token: 'new-jwt-token' } },
        error: false
      };

      localStorageMiddleware(store)(next)(action);

      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', 'new-jwt-token');
      expect(next).toHaveBeenCalledWith(action);
    });

    test('does not save token on LOGIN error', () => {
      const action = {
        type: LOGIN,
        payload: { errors: { message: 'Invalid credentials' } },
        error: true
      };

      localStorageMiddleware(store)(next)(action);

      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(action);
    });

    test('clears token from localStorage on LOGOUT', () => {
      const action = { type: LOGOUT };

      localStorageMiddleware(store)(next)(action);

      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', '');
      expect(next).toHaveBeenCalledWith(action);
    });

    test('passes through non-auth actions', () => {
      const action = { type: 'OTHER_ACTION', payload: 'data' };

      localStorageMiddleware(store)(next)(action);

      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(action);
    });
  });
});
