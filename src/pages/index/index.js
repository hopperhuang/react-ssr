import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import fetch from 'dva/fetch';
import createPage from 'SSR/createPage';
import styles from './index.css';
import pic from './images/panghu.jpg';


class IndexPage extends React.Component {
  // eslint-disable-next-line
  static async getInitialProps(isServer, urlOrLocaiont, dispatch, dvaInstance) {
    await dispatch({ type: 'index/getUserName' });
    const userInfo = await fetch('http://localhost:3000/user').then(res => res.json());
    return userInfo;
  }

  constructor(props) {
    super(props);
    this.onClickHandler = this.onClickHandler.bind(this);
    this.changeRuduxUserName = this.changeRuduxUserName.bind(this);
  }
  // eslint-disable-next-line
  onClickHandler() {
    const { setInitialProps } = this.props;
    setInitialProps({
      user: 'maoyan-shanghai',
    }).then(() => {
      console.log(23333);
    });
  }

  componentDidMount() {
    // you shouldn't use this.porps.initialProps.isFirstRender here
    // for setState is async
    // render and componentDidMount method is excute becfore setState
    console.log(this.props);
  }
  // eslint-disable-next-line
  async getUserInfo() {
    const userInfo = await fetch('http://localhost:3000/user').then(res => res.json());
    return userInfo;
  }

  changeRuduxUserName() {
    const { dispatch } = this.props;
    dispatch({
      type: 'index/setUserName',
      payload: 'maoyan-shanghai',
    });
  }


  render() {
    const { initialProps, index } = this.props;
    const { user: reduxUser } = index;
    const { user } = initialProps;
    return (
      <div>
        <p>这是一个ssr-index页面</p>
        <p>{user}</p>
        <img src={pic} alt="panghu" />
        <p>
        reduxuser:
          {reduxUser}
        </p>
        <p className={styles.red} onClick={this.onClickHandler}>click me</p>
        <p onClick={this.changeRuduxUserName}>click me change redux user name</p>
        <Link to="/about">去关于页面</Link>
      </div>
    );
  }
}

export default createPage(connect((state) => { return { index: state.index }; })(IndexPage));
