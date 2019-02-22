import React from 'react';
import { initialPropsContext } from './initialPropsContext';

class InitialPropsProvider extends React.Component {
  constructor(props) {
    super(props);
    const { initialProps } = props;
    // todo: change to promise, used to show Loading after state has been change,
    // and continue operation
    this.setInitialProps = (newProps) => {
      const self = this;
      return new Promise((resolve) => {
        self.setState({
          // eslint-disable-next-line
                initialProps: newProps,
        }, () => {
          resolve();
        });
      });
    };
    this.state = {
      // eslint-disable-next-line
      initialProps,
      // eslint-disable-next-line
      setInitialProps: this.setInitialProps,
    };
  }

  render() {
    const Context = initialPropsContext;
    const { children } = this.props;
    return (
      <Context.Provider value={this.state}>
        {children}
      </Context.Provider>
    );
  }
}

export default InitialPropsProvider;
