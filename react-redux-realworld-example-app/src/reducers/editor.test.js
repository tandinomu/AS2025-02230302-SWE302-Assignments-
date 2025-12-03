import editorReducer from './editor';
import {
  EDITOR_PAGE_LOADED,
  EDITOR_PAGE_UNLOADED,
  ARTICLE_SUBMITTED,
  ASYNC_START,
  ADD_TAG,
  REMOVE_TAG,
  UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';

describe('editor reducer', () => {
  test('returns initial state when no action provided', () => {
    const state = editorReducer(undefined, {});
    expect(state).toEqual({});
  });

  test('handles EDITOR_PAGE_LOADED with article data', () => {
    const action = {
      type: EDITOR_PAGE_LOADED,
      payload: {
        article: {
          slug: 'test-article',
          title: 'Test Article',
          description: 'Test Description',
          body: 'Test Body',
          tagList: ['react', 'testing']
        }
      }
    };

    const state = editorReducer({}, action);
    expect(state.articleSlug).toBe('test-article');
    expect(state.title).toBe('Test Article');
    expect(state.description).toBe('Test Description');
    expect(state.body).toBe('Test Body');
    expect(state.tagList).toEqual(['react', 'testing']);
    expect(state.tagInput).toBe('');
  });

  test('handles EDITOR_PAGE_LOADED without payload (new article)', () => {
    const action = {
      type: EDITOR_PAGE_LOADED,
      payload: null
    };

    const state = editorReducer({}, action);
    expect(state.articleSlug).toBe('');
    expect(state.title).toBe('');
    expect(state.description).toBe('');
    expect(state.body).toBe('');
    expect(state.tagList).toEqual([]);
    expect(state.tagInput).toBe('');
  });

  test('handles EDITOR_PAGE_UNLOADED', () => {
    const initialState = {
      title: 'Test Article',
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['react']
    };

    const action = { type: EDITOR_PAGE_UNLOADED };
    const state = editorReducer(initialState, action);
    expect(state).toEqual({});
  });

  test('handles UPDATE_FIELD_EDITOR for title', () => {
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'title',
      value: 'New Article Title'
    };

    const state = editorReducer({}, action);
    expect(state.title).toBe('New Article Title');
  });

  test('handles UPDATE_FIELD_EDITOR for description', () => {
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'description',
      value: 'New Description'
    };

    const state = editorReducer({}, action);
    expect(state.description).toBe('New Description');
  });

  test('handles UPDATE_FIELD_EDITOR for body', () => {
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'body',
      value: 'New article body content'
    };

    const state = editorReducer({}, action);
    expect(state.body).toBe('New article body content');
  });

  test('handles UPDATE_FIELD_EDITOR for tagInput', () => {
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'tagInput',
      value: 'react'
    };

    const state = editorReducer({}, action);
    expect(state.tagInput).toBe('react');
  });

  test('handles multiple UPDATE_FIELD_EDITOR actions', () => {
    let state = editorReducer({}, {
      type: UPDATE_FIELD_EDITOR,
      key: 'title',
      value: 'My Article'
    });

    state = editorReducer(state, {
      type: UPDATE_FIELD_EDITOR,
      key: 'description',
      value: 'My Description'
    });

    expect(state.title).toBe('My Article');
    expect(state.description).toBe('My Description');
  });

  test('handles ADD_TAG', () => {
    const initialState = {
      tagList: ['react'],
      tagInput: 'javascript'
    };

    const action = { type: ADD_TAG };
    const state = editorReducer(initialState, action);
    expect(state.tagList).toEqual(['react', 'javascript']);
    expect(state.tagInput).toBe('');
  });

  test('handles ADD_TAG to empty tagList', () => {
    const initialState = {
      tagList: [],
      tagInput: 'react'
    };

    const action = { type: ADD_TAG };
    const state = editorReducer(initialState, action);
    expect(state.tagList).toEqual(['react']);
    expect(state.tagInput).toBe('');
  });

  test('handles REMOVE_TAG', () => {
    const initialState = {
      tagList: ['react', 'javascript', 'testing']
    };

    const action = {
      type: REMOVE_TAG,
      tag: 'javascript'
    };

    const state = editorReducer(initialState, action);
    expect(state.tagList).toEqual(['react', 'testing']);
  });

  test('handles REMOVE_TAG when tag does not exist', () => {
    const initialState = {
      tagList: ['react', 'javascript']
    };

    const action = {
      type: REMOVE_TAG,
      tag: 'python'
    };

    const state = editorReducer(initialState, action);
    expect(state.tagList).toEqual(['react', 'javascript']);
  });

  test('handles ASYNC_START for ARTICLE_SUBMITTED', () => {
    const action = {
      type: ASYNC_START,
      subtype: ARTICLE_SUBMITTED
    };

    const state = editorReducer({ title: 'Test' }, action);
    expect(state.inProgress).toBe(true);
    expect(state.title).toBe('Test');
  });

  test('handles ARTICLE_SUBMITTED success', () => {
    const action = {
      type: ARTICLE_SUBMITTED,
      error: false,
      payload: { article: { slug: 'new-article' } }
    };

    const state = editorReducer({ inProgress: true }, action);
    expect(state.inProgress).toBe(null);
    expect(state.errors).toBe(null);
  });

  test('handles ARTICLE_SUBMITTED failure with errors', () => {
    const action = {
      type: ARTICLE_SUBMITTED,
      error: true,
      payload: {
        errors: {
          title: ["can't be blank"],
          description: ["can't be blank"]
        }
      }
    };

    const state = editorReducer({ inProgress: true }, action);
    expect(state.inProgress).toBe(null);
    expect(state.errors).toEqual({
      title: ["can't be blank"],
      description: ["can't be blank"]
    });
  });

  test('preserves state for unknown action types', () => {
    const initialState = {
      title: 'Test Article',
      description: 'Test Description',
      tagList: ['react']
    };

    const action = { type: 'UNKNOWN_ACTION' };
    const state = editorReducer(initialState, action);
    expect(state).toEqual(initialState);
  });
});
