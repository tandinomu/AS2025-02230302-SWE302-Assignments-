import React from 'react';
import Header from './Header';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';

describe('Header Component', () => {
  const appName = 'Conduit';

  test('renders logged out view when currentUser is null', () => {
    const component = renderer.create(
      React.createElement(BrowserRouter, null,
        React.createElement(Header, { appName, currentUser: null })
      )
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders logged in view when currentUser exists', () => {
    const currentUser = {
      username: 'testuser',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg'
    };

    const component = renderer.create(
      React.createElement(BrowserRouter, null,
        React.createElement(Header, { appName, currentUser })
      )
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
