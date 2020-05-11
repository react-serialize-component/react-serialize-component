import { AxiosRequestConfig } from 'axios';
import { PlainObject, Env, AxiosConfig } from './types';

export const env: Env = {
  proxy: {
    request: {
      '.*': function all(result) {
        // console.log(result);
        return result;
      },
    },
    response: {},
  },
  alert(msg) {
    // eslint-disable-next-line no-alert
    window.alert(msg);
  },
  confirm(msg, title) {
    // eslint-disable-next-line no-alert
    // eslint-disable-next-line no-restricted-globals
    const res = window.confirm(msg);
    return Promise.resolve(res);
  },
};
export default function setEnv(opt: PlainObject) {
  Object.assign(env, opt);
}

export function detailReq(config: AxiosConfig): AxiosConfig {
  const url: string = config.url || '';
  const { proxy: { request = {} } = {} } = env;
  const keys = Object.keys(request);
  return keys.reduce((result, cur) => {
    const reg = new RegExp(cur, 'g');
    if (reg.test(url)) {
      result = (request[cur](config) || result) as AxiosConfig;
    }
    return result;
  }, config);
}

export function detailRes(url = '', data: any) {
  const { proxy: { response = {} } = {} } = env;
  const keys = Object.keys(response);
  return keys.reduce((result, cur) => {
    const reg = new RegExp(cur, 'g');
    if (reg.test(url)) {
      result = response[cur](data) || result;
    }
    return result;
  }, data);
}
