import React from 'react';
import { Router, StaticRouter } from 'dva/router';
import App from './App';
import InitialPropsProvider from './InitialPropsProvider';


export default function createApp({
  isServer, req, initialProps, routes,
}) {
  /* eslint-disable-next-line */
  const context = {}
  // eslint-disable-next-line
  const app =  ({history, app}) => {
    return isServer ? (
      <StaticRouter location={req.url} context={context}>
        <InitialPropsProvider initialProps={initialProps}>
          <App routes={routes} />
        </InitialPropsProvider>
      </StaticRouter>
    ) : (
      <Router history={history}>
        <InitialPropsProvider initialProps={initialProps}>
          <App routes={routes} />
        </InitialPropsProvider>
      </Router>
    );
  };
  return {
    app,
    context,
  };
}
