import { AxiosRequestConfig } from 'axios';

export interface PlainObject {
  [propsName: string]: any;
}

/**
 * 模板字符串，以当前组件数据做上下文,会被编译成一个function然后返回值，值可以是基础数据类型
 */
export type templateString = string;
/**
 *模板函数，以当前数据作为上下文 会被编译成一个 function，供事件调用
 */
export type templateFun = string;

/**
 * 数据接口返回的统一格式
 */
export interface Payload {
  message: string;
  data: any;
  code: number;
  status: number;
}

export interface AnyFunc {
  (...reset: any): any;
}

export interface Env {
  proxy: {
    request?: {
      [reg: string]: (config: PlainObject) => PlainObject;
    };
    response?: {
      [reg: string]: (data: any) => any;
    };
  };
  alert: (msg: string) => void;
  confirm: (msg: string, title?: string) => Promise<boolean>;
  [propName: string]: any;
}

export interface AxiosConfig extends AxiosRequestConfig {
  // 请求字段的配置
  data?: PlainObject;
  // 请求或者相应适配
  requestAdapter?: AnyFunc;
  responseAdapter?: AnyFunc;
  errCode: PlainObject;
}
