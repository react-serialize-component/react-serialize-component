import React from 'react';
import { create, dvaCoreOpt, CreateOpt, DvaInstance, Model, EffectsMapObject, EffectsCommandMap } from 'dva-core';
import merge from 'deepmerge';
import createLoading from 'dva-loading';
import { connect, Provider } from 'react-redux';

import { Store, Action } from 'redux';
import isPlainObject from 'lodash/isPlainObject';
import axios from 'axios';
import isEmpty from 'lodash/isEmpty';
import { isExpressionStr, isTplStr } from './utils';
import template from './art';
import { SchemaNode, DataSource, DataSources, isFetchOptions, isTplOptions } from './schema';
import { PlainObject } from './types';

(window as any).template = template;
const overwriteMerge = (destinationArray: Array<any>, sourceArray: Array<any>, options: PlainObject) => sourceArray;

export type dvaIns = DvaInstance & {
  getStore(): Store;
  _store: Store;
  _models: Array<Model>;
  getModels(): Array<Model>;
  replaceModel(...rest: any): any;
};

export interface PayloadAction extends Action {
  payload?: PlainObject | null | undefined;
}

export default (opt: dvaCoreOpt = {}, createOpt?: CreateOpt) => {
  const win: any = window;
  if (win.dva) {
    return win.dva;
  }
  const app = create(opt, createOpt);
  opt.models = opt.models || [];
  opt.models.forEach((model: Model) => app.model(model));
  app.use(createLoading());
  app.start();
  const appIns = app as dvaIns;
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
    const { data = {}, ...otherProps } = dataSource;
    const otherKeys = Object.keys(otherProps);
    const effects: EffectsMapObject = {};
    otherKeys.reduce((res, key) => {
      const one = otherProps[key];
      // 处理不同的模板
      async function detail(action: PayloadAction, state: any) {
        let effectRes;
        const t = typeof one;
        // 直接是一个函数。。。。
        if (t === 'function') {
          effectRes = await one(action.payload || {}, state);
        } else if (isFetchOptions(one)) {
          // 一个请求对象
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
              state,
              payload: action.payload,
              ...(state[namespace] || {}),
            });
          }
          effectRes = await axios(cfg);
        } else if (isExpressionStr(one)) {
          // 一个表达式类似 ${abc}
          const compileRes = template.compile(one)({
            ...(action.payload || {}),
            state,
            payload: action.payload,
            ...(state[namespace] || {}),
          });
          if (isPlainObject(compileRes)) {
            effectRes = compileRes;
          } else if (typeof compileRes === 'string' && compileRes.indexOf('/') > -1) {
            let url = compileRes;
            if (isTplStr(compileRes)) {
              url = template.compile(compileRes)({
                ...(action.payload || {}),
                state,
                payload: action.payload,
                ...(state[namespace] || {}),
              });
            }
            effectRes = axios({
              url,
            });
          }
        } else if (isTplOptions(one) && one.tpl) {
          // 一个模板对象类似{tpl: ${abc}}
          effectRes = template.compile(one.tpl)({
            ...(action.payload || {}),
            state,
            payload: action.payload,
            ...(state[namespace] || {}),
          });
        }
        return effectRes;
      }
      if (!data[key]) {
        data[key] = {};
      }
      res[key] = function* effect(action: PayloadAction, effectsMethod: EffectsCommandMap) {
        const state = yield effectsMethod.select((s: any) => s);
        const resultData = yield effectsMethod.call(detail, action, state);
        if (resultData) {
          yield effectsMethod.put({
            type: 'update',
            payload: {
              [key]: resultData,
            },
          });
        }
        return resultData;
      };
      return res;
    }, effects);
    const model: Model = {
      namespace,
      state: data,
      reducers: {
        update(state, { payload = {} }: PayloadAction) {
          if (!payload) {
            return state;
          }
          const stateKeys = Object.keys(payload);
          const newState = { ...state };
          return stateKeys.reduce((ss, key, index) => {
            if (!state[key] || isEmpty(state[key])) {
              ss[key] = payload[key];
            } else {
              ss[key] = merge(state[key], payload[key] as any, { arrayMerge: overwriteMerge });
            }
            return ss;
          }, newState);
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
