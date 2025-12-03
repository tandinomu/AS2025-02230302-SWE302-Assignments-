import {
  LOGIN,
  REGISTER,
  LOGOUT,
  UPDATE_FIELD_AUTH,
  UPDATE_FIELD_EDITOR,
  ADD_TAG,
  REMOVE_TAG,
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  HOME_PAGE_LOADED,
  SET_PAGE
} from './constants/actionTypes';

describe('Action Creators', () => {
  describe('Authentication Actions', () => {
    test('LOGIN action has correct type', () => {
      const action = {
        type: LOGIN,
        payload: { user: { email: 'test@test.com', token: 'jwt-token' } }
      };
      expect(action.type).toBe('LOGIN');
      expect(action.payload.user.email).toBe('test@test.com');
    });

    test('REGISTER action has correct type', () => {
      const action = {
        type: REGISTER,
        payload: { user: { email: 'new@test.com', username: 'newuser', token: 'jwt-token' } }
      };
      expect(action.type).toBe('REGISTER');
      expect(action.payload.user.username).toBe('newuser');
    });

    test('LOGOUT action has correct type', () => {
      const action = { type: LOGOUT };
      expect(action.type).toBe('LOGOUT');
    });

    test('UPDATE_FIELD_AUTH action includes key and value', () => {
      const action = {
        type: UPDATE_FIELD_AUTH,
        key: 'email',
        value: 'test@example.com'
      };
      expect(action.type).toBe('UPDATE_FIELD_AUTH');
      expect(action.key).toBe('email');
      expect(action.value).toBe('test@example.com');
    });
  });

  describe('Editor Actions', () => {
    test('UPDATE_FIELD_EDITOR action includes key and value', () => {
      const action = {
        type: UPDATE_FIELD_EDITOR,
        key: 'title',
        value: 'My Article Title'
      };
      expect(action.type).toBe('UPDATE_FIELD_EDITOR');
      expect(action.key).toBe('title');
      expect(action.value).toBe('My Article Title');
    });

    test('ADD_TAG action has correct type', () => {
      const action = { type: ADD_TAG };
      expect(action.type).toBe('ADD_TAG');
    });

    test('REMOVE_TAG action includes tag to remove', () => {
      const action = {
        type: REMOVE_TAG,
        tag: 'react'
      };
      expect(action.type).toBe('REMOVE_TAG');
      expect(action.tag).toBe('react');
    });
  });

  describe('Article Actions', () => {
    test('ARTICLE_FAVORITED action includes article payload', () => {
      const action = {
        type: ARTICLE_FAVORITED,
        payload: {
          article: {
            slug: 'test-article',
            favorited: true,
            favoritesCount: 10
          }
        }
      };
      expect(action.type).toBe('ARTICLE_FAVORITED');
      expect(action.payload.article.favorited).toBe(true);
      expect(action.payload.article.favoritesCount).toBe(10);
    });

    test('ARTICLE_UNFAVORITED action includes article payload', () => {
      const action = {
        type: ARTICLE_UNFAVORITED,
        payload: {
          article: {
            slug: 'test-article',
            favorited: false,
            favoritesCount: 9
          }
        }
      };
      expect(action.type).toBe('ARTICLE_UNFAVORITED');
      expect(action.payload.article.favorited).toBe(false);
      expect(action.payload.article.favoritesCount).toBe(9);
    });

    test('HOME_PAGE_LOADED action includes payload with articles and tags', () => {
      const action = {
        type: HOME_PAGE_LOADED,
        payload: [
          { tags: ['react', 'javascript'] },
          { articles: [{ slug: 'article-1' }], articlesCount: 1 }
        ]
      };
      expect(action.type).toBe('HOME_PAGE_LOADED');
      expect(action.payload[0].tags).toEqual(['react', 'javascript']);
      expect(action.payload[1].articles).toHaveLength(1);
    });

    test('SET_PAGE action includes page number and payload', () => {
      const action = {
        type: SET_PAGE,
        page: 2,
        payload: {
          articles: [{ slug: 'article-3' }],
          articlesCount: 20
        }
      };
      expect(action.type).toBe('SET_PAGE');
      expect(action.page).toBe(2);
      expect(action.payload.articlesCount).toBe(20);
    });
  });

  describe('Action Type Constants', () => {
    test('LOGIN constant is defined correctly', () => {
      expect(LOGIN).toBe('LOGIN');
    });

    test('REGISTER constant is defined correctly', () => {
      expect(REGISTER).toBe('REGISTER');
    });

    test('LOGOUT constant is defined correctly', () => {
      expect(LOGOUT).toBe('LOGOUT');
    });

    test('UPDATE_FIELD_AUTH constant is defined correctly', () => {
      expect(UPDATE_FIELD_AUTH).toBe('UPDATE_FIELD_AUTH');
    });

    test('UPDATE_FIELD_EDITOR constant is defined correctly', () => {
      expect(UPDATE_FIELD_EDITOR).toBe('UPDATE_FIELD_EDITOR');
    });
  });
});
