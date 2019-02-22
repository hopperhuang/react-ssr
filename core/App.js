import React from 'react';
import { Switch, Route } from 'dva/router';


class App extends React.Component {
  render() {
    const { routes } = this.props;
    return (
      <Switch>
        {
              routes.map(route => (
                <Route {...route} />
              ))
              }
      </Switch>
    );
  }
}

export default App;
