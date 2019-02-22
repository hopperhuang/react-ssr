import React from 'react';
import { Link } from 'dva/router';
import fetch from 'dva/fetch';
import createPage from 'SSR/createPage';
import styles from './index.css';


class Page extends React.Component {
  // eslint-disable-next-line
  static async getInitialProps(isServer, urlOrLocation, dispatch, dvaInstance) {
    const userInfo = await fetch('http://localhost:3000/user').then(res => res.json());
    return userInfo;
  }

  render() {
    const { initialProps } = this.props;
    const { user } = initialProps;
    return (
      <div className={styles.blue}>
        <p>{user}</p>
        <Link to="/">返回首页</Link>
      </div>
    );
  }
}

export default createPage(Page);
