import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';
import { createHistory, useBasename } from 'history';

import { routes } from './routes';

const history = useBasename(createHistory)({
  basename: '/'
});

render(<Router history={history} routes={routes}/>, document.getElementById('app'));
