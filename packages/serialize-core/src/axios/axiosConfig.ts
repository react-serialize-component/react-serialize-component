import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { PlainObject, Payload } from '../types';
import './axiosStatus';
// const urlTest = /(?:https*:)*\/\/([^/]+)/;
interface AxiosConfig extends AxiosRequestConfig {
  errCode: PlainObject;
}

const CancelToken = axios.CancelToken;
axios.defaults.timeout = 30000;

(window as any).axios = axios;
const lockUrl: PlainObject = {};

// 后到优先策略：取消前一个未完成的ajax请求，然后发送新的ajax请求
const s1 = /^@.+/;

// 节约型策略：即共享类型，由同类型的第一个请求发送ajax，（在第一个ajax返回之前的）后续的同类型共享ajax返回结果
const s2 = /^\!.+/;

const detailLockKey = (config: any, promise: Promise<any>) => {
  const { lockKey } = config;
  if (!lockKey) {
    return promise;
  }
  lockUrl[lockKey] = lockUrl[lockKey] || [];
  const cur = lockUrl[lockKey].slice(0);
  // 取消前面的请求
  if (cur.length && s1.test(lockKey)) {
    cur.forEach((one: any) => {
      one.config.source.cancel();
    });
    lockUrl[lockKey] = [];
  }
  if (cur.length && s2.test(lockKey)) {
    const p = cur[0].promise;
    p.then(
      () => {
        lockUrl[lockKey] = [];
      },
      () => {
        lockUrl[lockKey] = [];
      }
    );
    config.source.cancel();
    return cur[0].promise;
  }
  lockUrl[lockKey].push({
    promise,
    config,
  });
  return promise;
};

// 添加时间戳
axios.interceptors.request.use(
  function(config) {
    const params = config.params || {};
    let headers = config.headers || {};
    params._t = +new Date();
    config.params = params;
    config.headers = headers;
    return config;
  },
  function(error) {
    const errCode = (axios.defaults as AxiosConfig).errCode;
    return Promise.reject({
      code: errCode.err.code,
      message: errCode.err.message,
    });
  }
);

axios.interceptors.response.use(
  function(res: AxiosResponse<Payload>): any {
    const errCode = (axios.defaults as AxiosConfig).errCode;
    const data = res.data;
    const status = res.status;
    // 将statusCode放上
    if (typeof data === 'object') {
      data.status = status;
    }
    if ((status >= 200 && status < 300) || status === 401) {
      if (!data || (typeof data === 'string' && (data as string).indexOf('<!DOCTYPE') >= 0)) {
        return {
          code: errCode.err.code,
          message: errCode.err.message,
        };
      }
      // 返回数据没有code字段认为出错了
      if (typeof data === 'object' && !data.code) {
        return {
          code: errCode.err.code,
          message: errCode.err.message,
        };
      }
      return data;
    }
    return {
      code: errCode.err.code,
      message: errCode.err.message,
    };
  },
  function(err: AxiosError) {
    const errCode = (axios.defaults as AxiosConfig).errCode;
    if (axios.isCancel(err)) {
      return {
        code: errCode.cancelErr.code,
        message: errCode.cancelErr.message,
      };
    }
    // console.dir(err);
    const message = err.message;
    // 超时错误
    // message是axios写的
    if (message.startsWith('timeout of')) {
      return {
        code: errCode.timeoutErr.code,
        message: errCode.timeoutErr.message,
      };
    }
    // 没有响应网络错误
    if (message.startsWith('Network Error')) {
      return {
        code: errCode.networkErr.code,
        message: errCode.networkErr.message,
      };
    }
    // 请求被打断
    if (message.startsWith('Request aborted')) {
      return {
        code: errCode.err.code,
        message: errCode.err.message,
      };
    }
    // 系统错误
    return {
      code: errCode.err.code,
      message: errCode.err.message,
    };
  }
);

const Axios = (axios as any).Axios;
const req = Axios.prototype.request;
/**
 * 覆盖全局request的方法，方便处理异常出现的情况
 */
Axios.prototype.request = function(config: any) {
  if (config.lockKey) {
    const source = CancelToken.source();
    config.source = source;
    config.cancelToken = source.token;
  }
  const promise = req.call(this, config);
  return detailLockKey(config, promise);
};
