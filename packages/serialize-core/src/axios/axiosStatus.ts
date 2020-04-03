import axios from 'axios';

// 所有请求默认的状态，可以自行添加
Object.assign(axios.defaults, {
  errCode: {
    err: {
      code: -99999,
      message: 'system error, please try again later',
    },
    success: {
      code: 10000,
      message: 'success',
    },
    networkErr: {
      code: -99996,
      message: 'network error',
    },
    timeoutErr: {
      code: -99998,
      message: 'time out error',
    },
    cancelErr: {
      code: -99997,
      message: 'request canceled',
    },
  },
});
