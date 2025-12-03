import authReducer from './auth';
import {
  LOGIN,
  REGISTER,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
  ASYNC_START,
  UPDATE_FIELD_AUTH
} from '../constants/actionTypes';

describe('auth reducer', () => {
  test('returns initial state when no action provided', () => {
    const state = authReducer(undefined, {});
    expect(state).toEqual({});
  });

  test('handles UPDATE_FIELD_AUTH for email', () => {
    const action = {
      type: UPDATE_FIELD_AUTH,
      key: 'email',
      value: 'test@example.com'
    };

    const state = authReducer({}, action);
    expect(state).toEqual({
      email: 'test@example.com'
    });
  });

  test('handles UPDATE_FIELD_AUTH for password', () => {
    const action = {
      type: UPDATE_FIELD_AUTH,
      key: 'password',
      value: 'password123'
    };

    const state = authReducer({}, action);
    expect(state).toEqual({
      password: 'password123'
    });
  });

  test('handles UPDATE_FIELD_AUTH for username', () => {
    const action = {
      type: UPDATE_FIELD_AUTH,
      key: 'username',
      value: 'testuser'
    };

    const state = authReducer({}, action);
    expect(state).toEqual({
      username: 'testuser'
    });
  });

  test('handles multiple UPDATE_FIELD_AUTH actions', () => {
    let state = authReducer({}, {
      type: UPDATE_FIELD_AUTH,
      key: 'email',
      value: 'test@example.com'
    });

    state = authReducer(state, {
      type: UPDATE_FIELD_AUTH,
      key: 'password',
      value: 'password123'
    });

    expect(state).toEqual({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  test('handles LOGIN success', () => {
    const action = {
      type: LOGIN,
      error: false,
      payload: {
        user: {
          email: 'test@example.com',
          token: 'jwt-token',
          username: 'testuser'
        }
      }
    };

    const state = authReducer({ inProgress: true }, action);
    expect(state.inProgress).toBe(false);
    expect(state.errors).toBe(null);
  });

  test('handles LOGIN failure with errors', () => {
    const action = {
      type: LOGIN,
      error: true,
      payload: {
        errors: {
          'email or password': ['is invalid']
        }
      }
    };

    const state = authReducer({ inProgress: true }, action);
    expect(state.inProgress).toBe(false);
    expect(state.errors).toEqual({
      'email or password': ['is invalid']
    });
  });

  test('handles REGISTER success', () => {
    const action = {
      type: REGISTER,
      error: false,
      payload: {
        user: {
          email: 'test@example.com',
          token: 'jwt-token',
          username: 'testuser'
        }
      }
    };

    const state = authReducer({ inProgress: true }, action);
    expect(state.inProgress).toBe(false);
    expect(state.errors).toBe(null);
  });

  test('handles REGISTER failure with errors', () => {
    const action = {
      type: REGISTER,
      error: true,
      payload: {
        errors: {
          email: ['has already been taken'],
          username: ['has already been taken']
        }
      }
    };

    const state = authReducer({ inProgress: true }, action);
    expect(state.inProgress).toBe(false);
    expect(state.errors).toEqual({
      email: ['has already been taken'],
      username: ['has already been taken']
    });
  });

  test('handles ASYNC_START for LOGIN', () => {
    const action = {
      type: ASYNC_START,
      subtype: LOGIN
    };

    const state = authReducer({ email: 'test@example.com' }, action);
    expect(state.inProgress).toBe(true);
    expect(state.email).toBe('test@example.com');
  });

  test('handles ASYNC_START for REGISTER', () => {
    const action = {
      type: ASYNC_START,
      subtype: REGISTER
    };

    const state = authReducer({ username: 'testuser' }, action);
    expect(state.inProgress).toBe(true);
    expect(state.username).toBe('testuser');
  });

  test('handles LOGIN_PAGE_UNLOADED', () => {
    const action = {
      type: LOGIN_PAGE_UNLOADED
    };

    const state = authReducer({
      email: 'test@example.com',
      password: 'password123',
      errors: { error: 'some error' }
    }, action);

    expect(state).toEqual({});
  });

  test('handles REGISTER_PAGE_UNLOADED', () => {
    const action = {
      type: REGISTER_PAGE_UNLOADED
    };

    const state = authReducer({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      errors: { error: 'some error' }
    }, action);

    expect(state).toEqual({});
  });

  test('preserves state for unknown action types', () => {
    const initialState = {
      email: 'test@example.com',
      password: 'password123'
    };

    const action = {
      type: 'UNKNOWN_ACTION'
    };

    const state = authReducer(initialState, action);
    expect(state).toEqual(initialState);
  });

  test('handles LOGIN error without payload', () => {
    const action = {
      type: LOGIN,
      error: true,
      payload: null
    };

    const state = authReducer({ inProgress: true }, action);
    expect(state.inProgress).toBe(false);
    expect(state.errors).toBe(null);
  });
});
