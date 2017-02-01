/**
 * Main app page
 *
 * Renders React Router and routes to the main page.
 * In the future this could be used to add new pages
 * to the project — views, documentation, etc.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';

import SearchPage from './SearchPage';

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={SearchPage}>
      <IndexRoute component={SearchPage} />
      <Route path="search" component={SearchPage} />
    </Route>
  </Router>
), document.getElementById('root'));
