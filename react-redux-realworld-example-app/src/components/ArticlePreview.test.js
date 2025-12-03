import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ArticlePreview from './ArticlePreview';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore([]);

describe('ArticlePreview Component', () => {
  let store;
  const mockArticle = {
    slug: 'test-article',
    title: 'Test Article Title',
    description: 'Test article description',
    body: 'Test article body',
    tagList: ['react', 'testing', 'javascript'],
    createdAt: '2024-01-01T00:00:00.000Z',
    favorited: false,
    favoritesCount: 5,
    author: {
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/avatar.jpg',
      following: false
    }
  };

  beforeEach(() => {
    store = mockStore({});
  });

  test('renders article with all data correctly', () => {
    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={mockArticle} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders favorited article correctly', () => {
    const favoritedArticle = { ...mockArticle, favorited: true, favoritesCount: 10 };

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={favoritedArticle} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders article without tags', () => {
    const articleNoTags = { ...mockArticle, tagList: [] };

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={articleNoTags} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders article with default author image', () => {
    const articleDefaultImage = {
      ...mockArticle,
      author: { ...mockArticle.author, image: null }
    };

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={articleDefaultImage} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders article with multiple tags', () => {
    const articleManyTags = {
      ...mockArticle,
      tagList: ['react', 'redux', 'testing', 'javascript', 'jest']
    };

    const component = renderer.create(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={articleManyTags} />
        </BrowserRouter>
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
