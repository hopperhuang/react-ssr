import React from 'react';
import { initialPropsContext } from './initialPropsContext';
import InitialPropsPage from './initialPropsPage';

export default function createPage(Com) {
  return class Page extends React.Component {
    // proxy Com's getInitialProps will and only be called in serve-side
    static async getInitialProps(iServer, url, dispatch, dvaInstance) {
      let initialProps;
      if (Com.getInitialProps && typeof Com.getInitialProps === 'function') { // getInitialProps exists
        // initialProps should be and must be an object
        try {
          initialProps = await Com.getInitialProps(iServer, url, dispatch, dvaInstance) || {};
          initialProps.isFirstRender = true;
          initialProps.isErrOccured = false;
        } catch (error) {
          initialProps = {};
          initialProps.isFirstRender = true;
          initialProps.isErrOccured = true;
        }
      } else { // getInitialProps dosn't exist
        initialProps = {};
        initialProps.isFirstRender = true;
        initialProps.isErrOccured = false;
      }
      return initialProps;
    }

    render() {
      const Context = initialPropsContext;
      const { props } = this;
      // use InitialPropsPage to handle get and set initialProps properly
      return (
        <Context.Consumer>
          {value => (
            <InitialPropsPage
              {...props}
              com={Com}
              initValue={value}
            />
          )}
        </Context.Consumer>

      );
    }
  };
}
