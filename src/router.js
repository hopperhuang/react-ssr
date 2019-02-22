import Loadable from 'react-loadable';
import indexModel from './pages/index/model';

// import { getInitialProps as indexGetInitialProps } from './pages/index/page';
// import { getInitialProps as aboutGetInitialProps } from './pages/about/page';


const LoadableIndex = Loadable({
  loader: () => import('./pages/index').then((m) => { LoadableIndex.getInitialProps = m.default.getInitialProps; return m; }),
  loading: () => null,
});

const LoadableAbout = Loadable({
  loader: () => import('./pages/about').then((m) => { LoadableAbout.getInitialProps = m.default.getInitialProps; return m; }),
  loading: () => null,
});


const routes = [
  {
    exact: true,
    path: '/',
    component: LoadableIndex,
    key: 'index',
    model: indexModel,
  },
  {
    path: '/about',
    component: LoadableAbout,
    key: 'about',
  },
];

export default routes;
