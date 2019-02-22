import React from 'react';

class InitialPropsPage extends React.Component {
  constructor(props) {
    super(props);
    // this will be called in server and client
    this.setInitialProps = this.setInitialProps.bind(this);
    this.callGetInitialProps = this.callGetInitialProps.bind(this);
    this.getCurrentScenarioInClient = this.getCurrentScenarioInClient.bind(this);
    this.state = {
      isLoading: false,
    };
    this.callGetInitialProps();
  }

  // we don't clear porps in unMount instead we init it when component is constructed
  // clear props when component willUnmount,
  // awlays happens when router change
  //   componentWillUnmount() {
  //     this.setInitialProps({});
  //   }


  // re-write setInitialProps here
  setInitialProps(newStateObject) {
    const { initValue } = this.props;
    const { setInitialProps } = initValue;
    return setInitialProps({
      isFirstRender: false,
      isErrOccured: false,
      ...newStateObject,
    });
  }

  getCurrentScenarioInClient() {
    const { initValue, com } = this.props;
    const { initialProps } = initValue;
    const { isFirstRender } = initialProps;
    const { getInitialProps } = com;
    let scenario;
    if (isFirstRender) { // first-redner
      scenario = 'firstRender';
      return scenario;
    }
    if (!!getInitialProps && typeof getInitialProps === 'function') { // router - change, has get
      scenario = 'noFirstGetInitialProps';
      return scenario;
    }
    if (!getInitialProps || typeof getInitialProps === 'function') { // router - change, no get
      scenario = 'noFirstNoGetInitialProps';
      return scenario;
    }
  }

  async callGetInitialProps() {
    const self = this;
    const { initValue, com, location } = this.props;
    const isServer = typeof window === 'undefined';
    const { getInitialProps } = com;
    // firstRender will not called, server render will not called
    // only will be called in client side when Component's getInitialProps exists,
    if (!isServer) { // just called in client
      const currentScenarioInClient = this.getCurrentScenarioInClient();
      if (currentScenarioInClient === 'firstRender') { // set isFirstRender to false, inherit other props
        const { initialProps } = initValue;
        const { isFirstRender: firstRender, ...restProps } = initialProps;
        await this.setInitialProps({ ...restProps });
      }
      if (currentScenarioInClient === 'noFirstGetInitialProps') {
        this.state.isLoading = true;
        let newProps;
        try {
          // for getInitalProps will not be called when firstRender
          // so that this method just will be called after dva().start()
          // the means we can get _store and dispatch here safely
          // eslint-disable-next-line
      const app = window.__DVAINSTANCE__ 
          // eslint-disable-next-line
      const {  dispatch } = app._store
          newProps = await getInitialProps(isServer, location, dispatch, app);
        } catch (error) {
          newProps = {};
          newProps.isErrOccured = true;
        }
        await self.setInitialProps(newProps);
        self.setState({
          isLoading: false,
        });
      }
      if (currentScenarioInClient === 'noFirstNoGetInitialProps') { // clear previous value
        this.state.isLoading = true;
        await this.setInitialProps({});
        this.setState({
          isLoading: false,
        });
      }
    }
  }


  render() {
    const { initValue, com, ...restProps } = this.props;
    const { isLoading } = this.state;
    const Com = com;
    return isLoading ? (<div />) : (
      <Com
        {...restProps}
        initialProps={initValue.initialProps}
        setInitialProps={this.setInitialProps}
      />
    );
  }
}

export default InitialPropsPage;
