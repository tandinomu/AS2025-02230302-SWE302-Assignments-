import React from 'react';
import ArticleList from './ArticleList';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';

// Mock child components
jest.mock('./ArticlePreview', () => 'ArticlePreview');
jest.mock('./ListPagination', () => 'ListPagination');

describe('ArticleList Component', () => {
  test('renders loading state when articles is null', () => {
    const component = renderer.create(
      <BrowserRouter>
        <ArticleList articles={null} />
      </BrowserRouter>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    expect(tree.children[0]).toBe('Loading...');
  });

  test('renders loading state when articles is undefined', () => {
    const component = renderer.create(
      <BrowserRouter>
        <ArticleList />
      </BrowserRouter>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders empty state when articles array is empty', () => {
    const component = renderer.create(
      <BrowserRouter>
        <ArticleList articles={[]} />
      </BrowserRouter>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    expect(tree.children[0]).toBe('No articles are here... yet.');
  });

  test('renders article list with multiple articles', () => {
    const mockArticles = [
      { slug: 'article-1', title: 'Test Article 1', description: 'Description 1', tagList: [] },
      { slug: 'article-2', title: 'Test Article 2', description: 'Description 2', tagList: [] },
      { slug: 'article-3', title: 'Test Article 3', description: 'Description 3', tagList: [] }
    ];

    const component = renderer.create(
      <BrowserRouter>
        <ArticleList articles={mockArticles} articlesCount={3} currentPage={0} />
      </BrowserRouter>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders single article correctly', () => {
    const mockArticles = [
      { slug: 'single-article', title: 'Single Article', description: 'Single Description', tagList: ['react'] }
    ];

    const component = renderer.create(
      <BrowserRouter>
        <ArticleList articles={mockArticles} articlesCount={1} />
      </BrowserRouter>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
