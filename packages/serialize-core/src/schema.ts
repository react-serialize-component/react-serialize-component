import React from 'react';
import { AxiosRequestConfig } from 'axios';
import isPlainObject from 'lodash/isPlainObject';
import { templateString, templateFun, Payload, AnyFunc, PlainObject, AxiosConfig } from './types';
import { anyChanged } from './utils';

// eslint-disable-next-line max-len
type schemaNodeProps = templateString | SchemaNode | templateFun | SchemaNodes | boolean | React.CSSProperties | number | AnyFunc;

export interface DataSource {
  // 数据默认值,就是初始的dva的state
  data?: {
    [propName: string]: any;
  };
  // 所有获取数据的方法
  [propName: string]: AxiosConfig | any;
}

export interface DataSources {
  [dataSourceName: string]: DataSource;
}

// 对比2组数据源，返回变化的部分
export function compareDataSource<T extends DataSources>(pre: T | null, next: T): T {
  if (!pre || !next) {
    return next;
  }
  const result: DataSources = {};
  const nextKeys = Object.keys(next);
  nextKeys.forEach(key => {
    if (!pre[key]) {
      result[key] = next[key];
    } else if (anyChanged(pre[key], next[key])) {
      result[key] = next[key];
    }
  });
  return result as T;
}

/**
 * 是否是一个fetch的接口
 * @param opt
 */
export function isFetchOptions(opt: any) {
  if (typeof opt === 'string') {
    return true;
  }
  if (isPlainObject(opt) && opt.url) {
    return true;
  }
  return false;
}
/**
 *
 * 模板检测
 * @param opt { tpl: '<%=abc%>'}
 */
export function isTplOptions(opt: any) {
  if (isPlainObject(opt) && opt.tpl && typeof opt.tpl === 'string') {
    return true;
  }
  return false;
}

/*
 * 从dataSource中检出的key
 */
type pickedKey = string;

export interface BindDataSource {
  [dataSourceName: string]: boolean | Array<pickedKey>;
}

export interface SchemaNode {
  type: string;
  // 用来替代type，当组件本身就需要type属性的时候，用$type作为组件的类型
  // $type=null的时候认为这个对象是个普通对象不是个组件
  $type?: string;
  name?: string;
  // 直接子节点
  children?: SchemaNode | Array<SchemaNode>;
  // 数据源对象
  DataSource: DataSources;
  // 绑定数据源
  bindData?: BindDataSource;
  [propName: string]: BindDataSource | schemaNodeProps | AnyFunc | undefined;
}

export type SchemaNodes = Array<SchemaNode>;

export interface SchemaRenderProps {
  schema: SchemaNode;
  data: any;
  // 通过Inject注入的组件
  component: any;
  // 全局环境设置
  env?: PlainObject;
}
