import articleListReducer from './articleList';
import {
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  SET_PAGE,
  APPLY_TAG_FILTER,
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  CHANGE_TAB,
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_LOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED
} from '../constants/actionTypes';

describe('articleList reducer', () => {
  test('returns initial state when no action provided', () => {
    const state = articleListReducer(undefined, {});
    expect(state).toEqual({});
  });

  test('handles HOME_PAGE_LOADED', () => {
    const action = {
      type: HOME_PAGE_LOADED,
      pager: {},
      tab: 'all',
      payload: [
        { tags: ['react', 'javascript'] },
        {
          articles: [
            { slug: 'article-1', title: 'Article 1' },
            { slug: 'article-2', title: 'Article 2' }
          ],
          articlesCount: 2
        }
      ]
    };

    const state = articleListReducer({}, action);
    expect(state.tags).toEqual(['react', 'javascript']);
    expect(state.articles).toHaveLength(2);
    expect(state.articlesCount).toBe(2);
    expect(state.currentPage).toBe(0);
    expect(state.tab).toBe('all');
  });

  test('handles HOME_PAGE_LOADED with null payload', () => {
    const action = {
      type: HOME_PAGE_LOADED,
      pager: {},
      tab: 'all',
      payload: null
    };

    const state = articleListReducer({}, action);
    expect(state.tags).toEqual([]);
    expect(state.articles).toEqual([]);
    expect(state.articlesCount).toBe(0);
  });

  test('handles HOME_PAGE_UNLOADED', () => {
    const initialState = {
      articles: [{ slug: 'article-1' }],
      articlesCount: 10,
      tags: ['react'],
      currentPage: 2
    };

    const action = { type: HOME_PAGE_UNLOADED };
    const state = articleListReducer(initialState, action);
    expect(state).toEqual({});
  });

  test('handles SET_PAGE', () => {
    const initialState = {
      articles: [],
      currentPage: 0
    };

    const action = {
      type: SET_PAGE,
      page: 2,
      payload: {
        articles: [
          { slug: 'article-3', title: 'Article 3' },
          { slug: 'article-4', title: 'Article 4' }
        ],
        articlesCount: 20
      }
    };

    const state = articleListReducer(initialState, action);
    expect(state.articles).toHaveLength(2);
    expect(state.articlesCount).toBe(20);
    expect(state.currentPage).toBe(2);
  });

  test('handles APPLY_TAG_FILTER', () => {
    const initialState = {
      articles: [],
      tab: 'all',
      tag: null
    };

    const action = {
      type: APPLY_TAG_FILTER,
      tag: 'react',
      pager: {},
      payload: {
        articles: [{ slug: 'react-article', title: 'React Article' }],
        articlesCount: 1
      }
    };

    const state = articleListReducer(initialState, action);
    expect(state.tag).toBe('react');
    expect(state.tab).toBe(null);
    expect(state.articles).toHaveLength(1);
    expect(state.currentPage).toBe(0);
  });

  test('handles CHANGE_TAB', () => {
    const initialState = {
      articles: [],
      tab: 'all',
      tag: 'react',
      currentPage: 2
    };

    const action = {
      type: CHANGE_TAB,
      tab: 'feed',
      pager: {},
      payload: {
        articles: [{ slug: 'feed-article', title: 'Feed Article' }],
        articlesCount: 5
      }
    };

    const state = articleListReducer(initialState, action);
    expect(state.tab).toBe('feed');
    expect(state.tag).toBe(null);
    expect(state.currentPage).toBe(0);
    expect(state.articles).toHaveLength(1);
  });

  test('handles ARTICLE_FAVORITED', () => {
    const initialState = {
      articles: [
        { slug: 'article-1', title: 'Article 1', favorited: false, favoritesCount: 5 },
        { slug: 'article-2', title: 'Article 2', favorited: false, favoritesCount: 10 }
      ]
    };

    const action = {
      type: ARTICLE_FAVORITED,
      payload: {
        article: {
          slug: 'article-1',
          title: 'Article 1',
          favorited: true,
          favoritesCount: 6
        }
      }
    };

    const state = articleListReducer(initialState, action);
    expect(state.articles[0].favorited).toBe(true);
    expect(state.articles[0].favoritesCount).toBe(6);
    expect(state.articles[1].favorited).toBe(false);
    expect(state.articles[1].favoritesCount).toBe(10);
  });

  test('handles ARTICLE_UNFAVORITED', () => {
    const initialState = {
      articles: [
        { slug: 'article-1', title: 'Article 1', favorited: true, favoritesCount: 6 },
        { slug: 'article-2', title: 'Article 2', favorited: false, favoritesCount: 10 }
      ]
    };

    const action = {
      type: ARTICLE_UNFAVORITED,
      payload: {
        article: {
          slug: 'article-1',
          title: 'Article 1',
          favorited: false,
          favoritesCount: 5
        }
      }
    };

    const state = articleListReducer(initialState, action);
    expect(state.articles[0].favorited).toBe(false);
    expect(state.articles[0].favoritesCount).toBe(5);
    expect(state.articles[1].favorited).toBe(false);
  });

  test('handles PROFILE_PAGE_LOADED', () => {
    const action = {
      type: PROFILE_PAGE_LOADED,
      pager: {},
      payload: [
        { profile: { username: 'testuser' } },
        {
          articles: [{ slug: 'profile-article', title: 'Profile Article' }],
          articlesCount: 1
        }
      ]
    };

    const state = articleListReducer({}, action);
    expect(state.articles).toHaveLength(1);
    expect(state.articlesCount).toBe(1);
    expect(state.currentPage).toBe(0);
  });

  test('handles PROFILE_FAVORITES_PAGE_LOADED', () => {
    const action = {
      type: PROFILE_FAVORITES_PAGE_LOADED,
      pager: {},
      payload: [
        { profile: { username: 'testuser' } },
        {
          articles: [{ slug: 'favorite-article', title: 'Favorite Article' }],
          articlesCount: 3
        }
      ]
    };

    const state = articleListReducer({}, action);
    expect(state.articles).toHaveLength(1);
    expect(state.articlesCount).toBe(3);
    expect(state.currentPage).toBe(0);
  });

  test('handles PROFILE_PAGE_UNLOADED', () => {
    const initialState = {
      articles: [{ slug: 'article-1' }],
      articlesCount: 5
    };

    const action = { type: PROFILE_PAGE_UNLOADED };
    const state = articleListReducer(initialState, action);
    expect(state).toEqual({});
  });

  test('handles PROFILE_FAVORITES_PAGE_UNLOADED', () => {
    const initialState = {
      articles: [{ slug: 'article-1' }],
      articlesCount: 5
    };

    const action = { type: PROFILE_FAVORITES_PAGE_UNLOADED };
    const state = articleListReducer(initialState, action);
    expect(state).toEqual({});
  });

  test('preserves state for unknown action types', () => {
    const initialState = {
      articles: [{ slug: 'article-1' }],
      articlesCount: 5,
      currentPage: 1
    };

    const action = { type: 'UNKNOWN_ACTION' };
    const state = articleListReducer(initialState, action);
    expect(state).toEqual(initialState);
  });
});
