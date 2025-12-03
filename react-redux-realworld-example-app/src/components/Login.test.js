import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore([]);

// Mock ListErrors component
jest.mock('./ListErrors', () => 'ListErrors');

describe('Login Component', () => {
  test('renders login form with empty fields', () => {
    const store = mockStore({
      auth: {
        email: '',
        password: '',
        inProgress: false,
        errors: null
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders login form with filled email and password', () => {
    const store = mockStore({
      auth: {
        email: 'test@example.com',
        password: 'password123',
        inProgress: false,
        errors: null
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders login form in progress state', () => {
    const store = mockStore({
      auth: {
        email: 'test@example.com',
        password: 'password123',
        inProgress: true,
        errors: null
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders login form with errors', () => {
    const store = mockStore({
      auth: {
        email: 'test@example.com',
        password: 'wrong',
        inProgress: false,
        errors: { 'email or password': ['is invalid'] }
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders login form structure correctly', () => {
    const store = mockStore({
      auth: {
        email: '',
        password: '',
        inProgress: false
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    // Verify it renders without crashing
    expect(tree).toBeTruthy();
  });
});
