import { setEnv } from '@react-serialize-component/core';
import { Modal, message } from 'antd';

setEnv({
  proxy: {
    // 拦截所有request做出处理
    request: {
      // config是ajax的配置，看axios的配置
      '.*': function all(config: any) {
        console.log(config);
        return config;
      },
    },
    // 拦截所有 response请求做出处理
    response: {
      '.*': function all(result: any) {
        console.log(result);
        return result;
      },
    },
  },
  // 设置alert方法
  alert(msg: string, config = {}) {
    // eslint-disable-next-line no-alert
    Modal.info({
      content: msg,
      ...config,
    });
  },
  // 设置confirm方法
  confirm(msg: string, config = {}) {
    // eslint-disable-next-line no-alert
    // eslint-disable-next-line no-restricted-globals
    const res = Modal.confirm({
      content: msg,
      ...config,
    });
    return Promise.resolve(res);
  },
  // 设置toast方法
  toast(content: string, duration: number, onClose: any) {
    message.info(content, duration, onClose);
  },
});
