import React from 'react';
import ReactDOM from 'react-dom';
import dva from 'dva';
import Loadable from 'react-loadable';
import createHistory from 'history/createBrowserHistory';
import createApp from 'SSR/createApp';
import routes from '../router';

// getInititalProps From window
const { initialProps, initialReduxState } = window;

// todo: register model just needed to optimzie performance,
// may be we can set a config in model

const dvaInstance = dva({
  // doc: https://reacttraining.com/react-router/web/api/Router
  // doc: https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/server-rendering.md
  history: createHistory(),
  initialState: initialReduxState,
});
// registerModel
for (let index = 0; index < routes.length; index += 1) {
  const route = routes[index];
  const { model } = route;
  if (model) {
    dvaInstance.model(model);
  }
}

// set Dvainstance to window so that we can get it easily later in getInitialPorps
// eslint-disable-next-line
window.__DVAINSTANCE__ =  dvaInstance
const { app } = createApp({ isServer: false, initialProps, routes });
dvaInstance.router(app);
const App = dvaInstance.start();

Loadable.preloadReady().then(() => {
  ReactDOM.hydrate(<App />, document.getElementById('app'));
});
