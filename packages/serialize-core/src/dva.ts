import React from 'react';
import { create, opt, createOpt, dvaInstance, Model } from 'dva-core';
import { SchemaNode, DataSource, DataSources, isFetchOptions, isTplOptions } from './schema';
import merge from 'deepmerge';
import template from './art';
import createLoading from 'dva-loading';
import { connect, Provider } from 'react-redux';
import { EffectsMapObject, EffectsCommandMap } from 'dva-core';
import { Store, Action } from 'redux';
import { PlainObject } from './types';
import { isExpressionStr, isTplStr } from './utils';
import isPlainObject from 'lodash/isPlainObject';
import axios from 'axios';

(window as any).template = template;
const overwriteMerge = (destinationArray: Array<any>, sourceArray: Array<any>, options: PlainObject) => sourceArray;

export type dvaIns = dvaInstance & {
  getStore(): Store;
  _store: Store;
  _models: Array<Model>;
  getModels(): Array<Model>;
  replaceModel(...rest: any): any;
};

export interface payloadAction extends Action {
  payload?: PlainObject | null | undefined;
}

export default (opt: opt = {}, createOpt?: createOpt) => {
  const win: any = window;
  if (win.dva) {
    return win.dva;
  }
  let app = create(opt, createOpt);
  opt.models = opt.models || [];
  opt.models.forEach((model: Model) => app.model(model));
  app.use(createLoading());
  app.start();
  let appIns = app as dvaIns;
  const store = appIns._store;
  appIns.getStore = () => store;
  appIns.getModels = () => appIns._models;
  win.dva = app;
  return app;
};
export interface Models {
  [namespace: string]: Model;
}
export { connect, Provider };

export function parseDataSource(dataSources: DataSources): Models {
  const result: Models = {};
  const keys = Object.keys(dataSources);
  keys.forEach(namespace => {
    const dataSource: DataSource = dataSources[namespace];
    let { data = {}, ...otherProps } = dataSource;
    const otherKeys = Object.keys(otherProps);
    const effects: EffectsMapObject = {};
    otherKeys.reduce((res, key) => {
      const one = otherProps[key];
      // 处理不同的模板
      async function detail(action: payloadAction, state: any) {
        let result;
        const t = typeof one;
        // 直接是一个函数。。。。
        if (t == 'function') {
          result = await one(action.payload || {}, state);
        } else if (isFetchOptions(one)) {
          //一个请求对象
          let cfg = one;
          if (typeof one === 'string') {
            cfg = {
              url: one,
            };
          }
          // 一个字符串模板类似 http://www.baidu.com/${abc}
          if (isTplStr(cfg.url)) {
            cfg.url = template.compile(cfg.url)({
              ...(action.payload || {}),
              state: state,
              payload: action.payload,
              ...(state[namespace] || {}),
            });
          }
          result = await axios(cfg);
        } else if (isExpressionStr(one)) {
          // 一个表达式类似 ${abc}
          const res = template.compile(one.tpl)({
            ...(action.payload || {}),
            state: state,
            payload: action.payload,
            ...(state[namespace] || {}),
          });
          if (!isPlainObject(res)) {
            result = res;
          } else if (typeof res === 'string' && res.indexOf('/') > -1) {
            let url = res;
            if (isTplStr(res)) {
              url = template.compile(res)({
                ...(action.payload || {}),
                state: state,
                payload: action.payload,
                ...(state[namespace] || {}),
              });
            }
            result = axios({
              url,
            });
          }
        } else if (isTplOptions(one) && one.tpl) {
          // 一个模板对象类似{tpl: ${abc}}
          result = template.compile(one.tpl)({
            ...(action.payload || {}),
            state: state,
            payload: action.payload,
            ...(state[namespace] || {}),
          });
        }
        console.log(1111, result);
        return result;
      }
      if (!data[key]) {
        data[key] = {};
      }
      res[key] = function*(action: payloadAction, effectsMethod: EffectsCommandMap) {
        const state = yield effectsMethod.select((state: any) => state);
        const result = yield effectsMethod.call(detail, action, state);
        if (result) {
          yield effectsMethod.put({
            type: 'update',
            payload: {
              [key]: result,
            },
          });
        }
        return result;
      };
      return res;
    }, effects);

    const model: Model = {
      namespace: namespace,
      state: data,
      reducers: {
        update(state, { payload = {} }: payloadAction) {
          if (!payload) {
            return state;
          }
          return merge(state, payload as any, { arrayMerge: overwriteMerge });
        },
      },
      effects,
    };
    result[namespace] = model;
  });
  return result;
}

export function findDataSource(schema: SchemaNode): DataSources {
  const dataSources: DataSources = {};
  const keys = Object.keys(schema);
  keys.forEach(key => {
    if (key === 'DataSource') {
      Object.assign(dataSources, { ...(schema[key] as object) });
    } else {
      const one = schema[key];
      const t = typeof one;
      if (t === 'object' && (one as SchemaNode).type) {
        Object.assign(dataSources, findDataSource(one as SchemaNode));
      }
    }
  });
  return dataSources;
}

// 采用自己的上下文去处理数据关系
export const dvaReduxConnectContext: any = React.createContext(null);

dvaReduxConnectContext.displayName = 'DvaReduxConnectContext';
