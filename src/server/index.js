import ReactDOMServer from 'react-dom/server';
import React from 'react';
import dva from 'dva';
import { matchPath } from 'dva/router';
import createMemoryHistory from 'history/createMemoryHistory'; // use memoryHistory in server-side
import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';
import createApp from 'SSR/createApp';
import loadableStats from 'Client/react-loadable.json';
import manifest from 'Client/manifest.json';
import routes from '../router';


// todo: handle errors when errors occured in getInitialProps
// todo: register model just needed to optimzie performance,
// may be we can set a config in model

const requestHandler = async (req) => {
  // doc: https://reacttraining.com/react-router/web/api/Router
  // doc: https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/server-rendering.md
  const history = createMemoryHistory({
    initialEntries: [req.url],
    initialIndex: 0,
  });
  // create-dva-instance
  const dvaInstance = dva({
    history,
  });
  // registerModel
  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index];
    const { model } = route;
    if (model) {
      dvaInstance.model(model);
    }
  }
  // hack is here:
  // for we can only get store which will be used in getInitialProps
  // after dva().start() so when add router and start here but do not render
  // github: https://github.com/dvajs/dva/blob/da20294a9a52c0762f9b0cf45d0243f9c47d6bb7/packages/dva/src/index.js#L44
  dvaInstance.router(() => {});
  dvaInstance.start();
  // get initial props
  // inital tasks
  const tasksQue = [];
  // 1. match routes and get getInitialProps as task
  const isMatch = routes.some((route) => {
    // use path but not url here for matchPath do not match queryString
    // github issue: https://github.com/ReactTraining/react-router/issues/5285
    const match = matchPath(req.path, route);
    if (match && route.component.getInitialProps) {
      tasksQue.push(route.component.getInitialProps);
    }
    return match;
  });
  if (isMatch) { // only render apps in when routes is match
    // eslint-disable-next-line
    const { dispatch } = dvaInstance._store;
    const task = tasksQue.map((method) => {
      const isServer = true;
      return method(isServer, req.url, dispatch, dvaInstance);
    });
      // run tasks
      // eslint-disable-next-line

    const [initialProps] = await Promise.all(task);
    // 2. get props
    const { app, context } = createApp({
      isServer: true, req, initialProps, routes,
    });
    // replace router for we have router before
    dvaInstance.router(app);
    const App = dvaInstance.start();
    // getInitialState
    // eslint-disable-next-line
    const initialReduxState = dvaInstance._store.getState()
    const modules = [];
    const markup = ReactDOMServer.renderToString(
      <Loadable.Capture report={moduleName => modules.push(moduleName)}>
        <App />
      </Loadable.Capture>,
    );


    // get script file list
    //   const styleFileName = manifest['main.css'];
    const scriptname = manifest['main.js'];
    // get needed bundles for dynamic
    const bundles = getBundles(loadableStats, modules);
    const bundlesStyles = bundles.filter(bundle => bundle.file.endsWith('.css'));
    const bundleScripts = bundles.filter(bundle => bundle.file.endsWith('.js'));
    // generate script content
    const scriptContent = `
    <script>
        window.initialProps = ${JSON.stringify(initialProps)}
        window.initialReduxState = ${JSON.stringify(initialReduxState)}
    </script>
  `;
      // generate page content
    const page = `<!DOCTYPE html>
     <html lang="en">
        <head>
    <meta charset="utf-8">
    <meta HTTP-EQUIV="pragma" CONTENT="no-cache">
    <meta HTTP-EQUIV="Cache-Control" CONTENT="no-cache, no-store, must-revalidate">
    <meta HTTP-EQUIV="expires" CONTENT="Wed, 26 Feb 1999 08:21:57 GMT">
    <meta HTTP-EQUIV="expires" CONTENT="0">
    <title> react-ssr </title>
    ${bundlesStyles.map((style) => {
    return `<link rel="stylesheet" type="text/css" href="${style.publicPath}" rel="stylesheet"/>`;
  }).join('\n')}
  </head>
  <body>
        <div id="app" >${markup}</div>
  </body>
  ${scriptContent}
  ${bundleScripts.map((bundle) => {
    return `<script src="${bundle.publicPath}"></script>`;
    // alternatively if you are using publicPath option in webpack config
    // you can use the publicPath value from bundle, e.g:
    // return `<script src="${bundle.publicPath}"></script>`
  }).join('\n')}
  <script src="${scriptname}" ></script>
  </html>
  `;

    return {
      page,
      status: 1,
      context,
    };
  } else {
    return {
      page: 'Not Found',
      status: 404,
      context: {},
    };
  }
};

export default requestHandler;
