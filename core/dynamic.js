import Loadable from 'react-loadable';

export const createAsyncPage = (options) => {
  const { loader } = options;
  const loaderType = typeof loader;
  let loadablePage;
  if (loaderType === 'function') {
    loadablePage = Loadable({
      ...options,
      loader: () => {
        return loader().then((m) => {
          loadablePage.getInitialProps = m.default.getInitialProps;
          return m;
        });
      },
    });
  } else if (loaderType === 'object') {
    const { Page } = loader; // page required to be defined
    loadablePage = Loadable.Map({
      ...options,
      loader: {
        ...loader,
        Page: () => { // get Page in render
          return Page().then((m) => {
            loadablePage.getInitialProps = m.default.getInitialProps;
            return m;
          });
        },
      },
    });
  } else {
    loadablePage = Loadable(options);
  }
  return loadablePage;
};

export const createAsyncComponent = (options) => {
  const { loader } = options;
  const loaderType = typeof loader;
  if (loaderType === 'object') {
    return Loadable.Map(options);
  } else {
    return Loadable(options);
  }
};
