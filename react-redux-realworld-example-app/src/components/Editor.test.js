import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Editor from './Editor';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore([]);

// Mock ListErrors component
jest.mock('./ListErrors', () => 'ListErrors');

describe('Editor Component', () => {
  const mockMatch = { params: {} };

  test('renders empty editor form for new article', () => {
    const store = mockStore({
      editor: {
        title: '',
        description: '',
        body: '',
        tagInput: '',
        tagList: [],
        inProgress: false,
        errors: null
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Editor match={mockMatch} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders editor form with article data', () => {
    const store = mockStore({
      editor: {
        articleSlug: 'test-article',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body Content',
        tagInput: '',
        tagList: ['react', 'testing'],
        inProgress: false,
        errors: null
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Editor match={mockMatch} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders editor form in progress state', () => {
    const store = mockStore({
      editor: {
        title: 'My Article',
        description: 'Description',
        body: 'Body',
        tagInput: '',
        tagList: ['javascript'],
        inProgress: true,
        errors: null
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Editor match={mockMatch} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders editor form with validation errors', () => {
    const store = mockStore({
      editor: {
        title: '',
        description: '',
        body: '',
        tagInput: '',
        tagList: [],
        inProgress: false,
        errors: {
          title: ["can't be blank"],
          description: ["can't be blank"],
          body: ["can't be blank"]
        }
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Editor match={mockMatch} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders editor form with multiple tags', () => {
    const store = mockStore({
      editor: {
        title: 'Tagged Article',
        description: 'Article with tags',
        body: 'Content here',
        tagInput: 'newtag',
        tagList: ['react', 'redux', 'javascript', 'testing'],
        inProgress: false
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Editor match={mockMatch} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders editor form with partial data', () => {
    const store = mockStore({
      editor: {
        title: 'Draft Article',
        description: '',
        body: '',
        tagInput: '',
        tagList: [],
        inProgress: false
      }
    });

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <Editor match={mockMatch} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
