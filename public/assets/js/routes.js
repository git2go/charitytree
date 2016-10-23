import React from 'react';
import { Route, IndexRoute } from 'react-router';

//============Unauthenticated Routes===============/
import App from './components/app.js';
import Home from './pages/home.js';
import Browse from './pages/browse.js';
import Search from './pages/search.js';
import Project from './pages/project.js';
import Organization from './pages/organization.js';
import Login from './pages/login.js';
import Signup from './pages/signup.js';
import Donate from './pages/donate.js';
import ThankYou  from './pages/thankyou.js';

//============Authenticated Routes===============/
import { Dashboard } from './pages/dashboard.js';


function redirectToDashboard(nextState, replaceState) {
    if (!loggedIn()) {
        replaceState({
            pathname: '/login',
            state: { nextPathname: nextState.location.pathname }
        })
    }
}

const loggedIn = function() {
    return !!localStorage.token;
};

const routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="login" component={Login} />
        <Route path="signup" component={Signup} />
        <Route path="browse" component={Browse} />
        <Route path="search" component={Search} />
          {/* <Route path="browse/detail/:uid" component={BrowseListingDetail} /> */}

        <Route path="dashboard" component={Dashboard}>
          {/*<Route path="profile" component={Profile} />*/}
          {/*<Route path="listings" component={}>
            <Route path="create" component={} />
            <Route path=":id" component={}>
              <Route path="edit" component={} />
            </Route>
          </Route>*/}
          {/*<Route path="applications" component={Applications} />*/}
        </Route>
    </Route>
);

module.exports = { routes, loggedIn }
