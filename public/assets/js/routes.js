//============Unauthenticated Routes===============/
import {App} from '../js/app.js';
import {Home} from '../js/home.js';
import {Browse} from '../js/browse.js';
import {Search} from '../js/search.js';
import {Project} from '../js/project.js';
import {Organization} from '../js/organization.js';
import {Login} from '../js/login.js';
import {Signup} from '../js/signup.js';
import {Donate} from '../js/donate.js';
import {Thankyou} from '../js/thankyou.js';

//============Authenticated Routes===============/
import {Dashboard} from '../js/dashboard.js';

var loggedIn = exports.loggedIn = function () {

  return !!localStorage.token;
};

function redirectToDashboard(nextState, replaceState) {
  if (loggedIn()) {
    replaceState(null, '/dashboard');
  }
}

exports.routes = {
  component: App,
  childRoutes: [
    { path: '/',
      getComponent: (location, cb) => {
        return require.ensure([], () => {
          cb(null, Home);
        });
      }
    },

    { path: '/dashboard',
      getComponent: (location, cb) => {
        // Share the path
        // Dynamically load the correct component
        if (loggedIn()) {
          return require.ensure([], () => {
            cb(null, Dashboard);
          })
        }
        return require.ensure([], () => {
          cb(null, Login);
        })
      }
    },
    { onEnter: redirectToDashboard,
      childRoutes: [
        // Unauthenticated routes
        // Redirect to dashboard if user is already logged in
        { path: '/login',
          getComponent: (location, cb) => {
            require.ensure([], () => {
              cb(null, Login);
            })
          }
        }
      ]
    },
    
    {
      path: '/donate',
      getComponent: (location, cb) => {
        // Share the path
        // Dynamically load the correct component
        if (loggedIn()) {
          return require.ensure([], () => {
            cb(null, Donate);
          })
        }
        return require.ensure([], () => {
          cb(null, Login);
        })
      }
    },
    { path: '/browse',
      getComponent: (location, cb) => {
        require.ensure([], () => {
          cb(null, Browse);
        });
      }
    },
    { path: '/search',
      getComponent: (location, cb) => {
        require.ensure([], () => {
          cb(null, Search);
        });
      }
    },
    { path: '/thankyou',
      getComponent: (location, cb) => {
        require.ensure([], () => {
          cb(null, Thankyou);
        });
      }
    },
    { path: '/project',
      getComponent: (location, cb) => {
        require.ensure([], () => {
          cb(null, Project);
        });
      }
    },
    { path: '/donate',
      getComponent: (location, cb) => {
        require.ensure([], () => {
          cb(null, Donate);
        });
      }
    },
    { path: '/login',
      getComponent: (location, cb) => {
        require.ensure([], () => {
          cb(null, Login);
        });
      }
    },
    { path: '/signup',
      getComponent: (location, cb) => {
        require.ensure([], () => {
          cb(null, Signup);
        });
      }
    },
    { path: '/organization',
      getComponent: (location, cb) => {
        require.ensure([], () => {
          cb(null, Organization);
        });
      }
    }
  ]
};
