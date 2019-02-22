import fetch from 'dva/fetch';

export default {
  namespace: 'index',
  state: {
    user: '',
  },
  reducers: {
    setUserName(state, { payload }) {
      const newState = state;
      newState.user = payload;
      return { ...newState };
    },
  },
  effects: {
    *getUserName(action, { put, call }) {
      const getUser = async () => {
        const user = await fetch('http://localhost:3000/user').then(res => res.json());
        return user;
      };
      const user = yield call(getUser);
      yield put({ type: 'setUserName', payload: user.user });
    },
  },
};
