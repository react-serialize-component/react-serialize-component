import React from 'react';
import './axios/axiosConfig';
import { Dispatch } from 'redux';
import pick from 'lodash/pick';
import { Model } from 'dva-core';
import isEmpty from 'lodash/isEmpty';
import isPlainObject from 'lodash/isPlainObject';
import memoize from 'fast-memoize';
import createDva, { Provider, dvaReduxConnectContext, connect, dvaIns, parseDataSource, findDataSource, Models } from './dva';
import { PlainObject } from './types';
import { BindDataSource, SchemaNode, DataSource, DataSources, compareDataSource, SchemaRenderProps } from './schema';
import template from './art';
import { isEventString, anyChanged, shallowEqualObjects } from './utils';
import { env as defaultEnv } from './env';

const excludeProps: Array<string> = ['style', 'className', 'gutter', 'justify', 'flex'];

export const componentSymobol = Symbol('schemaComponent');
export const preDataSourcesSymobol = Symbol('preDataSources');
interface InjectConnect {
  (target: React.ComponentType): React.ComponentType | null | undefined;
}
interface App {
  [componentSymobol]: {
    [propName: string]: any;
  };
  [preDataSourcesSymobol]: DataSources | null;
  // 注册一个组件
  register(name: string, component: React.ComponentType): any;
  // 渲染schema的数
  render(SchemaNode: any): JSX.Element | null | undefined | false;
  // 初始化组件所用--注入store
  injectData(opt: BindDataSource): InjectConnect;
  [propName: string]: any;
}

const dva: dvaIns = createDva({
  initialState: {},
});

function isLikeSchemaNode(obj: any) {
  if (isPlainObject(obj)) {
    if (obj.$type && typeof obj.$type === 'string') {
      return true;
    }
    if (obj.$type === undefined && obj.type && typeof obj.type === 'string') {
      return true;
    }
  }
  return false;
}

class SchemaWrapper extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    const { errorInfo, error } = this.state;
    const { children, type } = this.props;
    if (errorInfo) {
      return (
        <div>
          <h2>{`render ${type} schema component error`}</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>{error && error.toString()}</details>
        </div>
      );
    }
    return children;
  }
}

class SchemaRender extends React.Component<SchemaRenderProps, any> {
  static defaultProps: Partial<SchemaRenderProps> = {
    data: {},
  };

  componentDidMount() {
    const { schema } = this.props;
    // console.log('in mount', schema.type);
    if (schema.onInit) {
      const fn = this.parseSchemaProps(schema.onInit, 'onInit');
      fn();
    }
  }

  shouldComponentUpdate(nextProps: SchemaRenderProps) {
    const { props } = this;
    const res = anyChanged(props.data, nextProps.data) || nextProps.component !== props.component;
    return res || !shallowEqualObjects(props.schema, nextProps.schema, ['bindData', 'DataSource']) || !shallowEqualObjects(props.env, nextProps.env);
  }

  /**
   *
   * @param prop 要解析的字段
   * @param 该字段的key，数组的时候没有
   */
  parseSchemaProps(prop: any, key: string | null | undefined): any {
    const { data, env } = this.props;
    const t = typeof prop;
    if (t === 'string' && prop !== '') {
      const fun = template.compile(prop as string);
      if (isEventString(key)) {
        return function str(e: any) {
          fun({
            e,
            env,
            data,
            ...env,
            ...data,
          });
        };
      }
      return fun({
        env,
        data,
        ...env,
        ...data,
      });
    }
    if (Array.isArray(prop)) {
      // 数组的情况
      return (prop as Array<any>).map((one: any, index) => {
        const res = this.parseSchemaProps(one, null);
        return <React.Fragment key={index}>{res}</React.Fragment>;
      });
    }
    if (t === 'object') {
      // 排除的key不在编译
      if (excludeProps.some(exkey => exkey === key)) {
        return prop;
      }
      return this.parseObjectProps(prop);
    }
    // 函数，数字，null， undefined都不动
    return prop;
  }

  // eslint-disable-next-line class-methods-use-this
  parseObjectProps(prop: PlainObject): any {
    console.log(prop);
    if (isLikeSchemaNode(prop)) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return app.initComponent(prop as SchemaNode);
    }
    const current = [prop];
    while (current.length) {
      const one = current.pop();
      if (one) {
        const keys = Object.keys(one);
        keys.forEach(key => {
          const childProp = one[key];
          if (excludeProps.some(exkey => exkey === key)) {
            return;
          }
          if (typeof childProp === 'object') {
            if (isLikeSchemaNode(childProp)) {
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              one[key] = app.initComponent(childProp as SchemaNode);
            } else {
              current.push(childProp);
            }
          }
        });
      }
    }
    return prop;
  }

  parseSchema(schema: SchemaNode) {
    const { $type, type, children, ...node } = schema;
    // 当前层的onInit在didMount处理
    const excludeKey: Array<string> = ['DataSource', 'bindData', 'onInit'];
    const result: any = {};
    const keys = Object.keys(node);
    if (!type === null) {
      keys.push(type);
    }
    keys.forEach(key => {
      if (!excludeKey.some(one => one === key)) {
        result[key] = this.parseSchemaProps(schema[key], key);
      }
    });
    return result;
  }

  render() {
    const { component: Com, schema, data } = this.props;
    const child = this.parseSchemaProps(schema.children, null);
    const { onInit, ...schemaProps } = this.parseSchema(schema);
    const otherProps: any = {};
    if (schema.$type) {
      otherProps.type = schema.type;
    }
    return (
      <div>
        <SchemaWrapper type={schema.$type || schema.type}>
          <Com {...schemaProps} {...otherProps}>
            {child}
          </Com>
        </SchemaWrapper>
      </div>
    );
  }
}

const memoizeCache: any = {};

const app: App = {
  [componentSymobol]: {},
  [preDataSourcesSymobol]: null,
  /**
   * 根据type把组件和schema挂钩
   * @param type schema中的type
   * @param component 解析对应schema的组件
   */
  register(type: string, component: React.ComponentType) {
    if (!type) {
      return;
    }
    if (!component) {
      return;
    }
    if (this[componentSymobol][type]) {
      return;
    }
    this[componentSymobol][type] = component;
  },
  unRegister(type: string) {
    if (this[componentSymobol][type]) {
      delete this[componentSymobol][type];
    }
  },
  // 根节点渲染
  render(schemaNode: SchemaNode | string) {
    // 进render方法，销毁整棵树，从来？
    // if (process.env.NODE_ENV !== 'production') {
    //   memoizeCache = {};
    //   console.log('mneme cache', memoizeCache);
    // }
    if (typeof schemaNode === 'string') {
      schemaNode = JSON.parse(schemaNode);
    }
    const node: SchemaNode = schemaNode as SchemaNode;
    return (
      <Provider store={dva.getStore()} context={dvaReduxConnectContext}>
        <SchemaWrapper type={node.$type || node.type}>{app.initComponent(node)}</SchemaWrapper>
      </Provider>
    );
  },
  initComponent(schemaNode: SchemaNode, otherProps: PlainObject = {}) {
    // 进入该这个方法意味着一定是个schema的组件
    let type: any = schemaNode.$type || schemaNode.type;
    if (!type) {
      throw new Error('schema node type is required!');
    }
    app.injectModal(schemaNode);
    const ConnectSchema: any = app.injectData(schemaNode.bindData || {});
    const component = app[componentSymobol][type];
    if (!component) {
      throw new Error(`The ${type} component could not be found, Use the register method to register ${type} component`);
    }
    type = type.slice(0, 1).toUpperCase() + type.slice(1);
    ConnectSchema.displayName = `${type}Schema`;
    return <ConnectSchema component={component} schema={schemaNode} env={defaultEnv} {...otherProps} />;
  },
  injectModal(schema: SchemaNode) {
    const nextDataSources = findDataSource(schema);
    const preDataSources = app[preDataSourcesSymobol];
    // 找到所有的DataSource，与缓存中对比，只修改变化的
    const dataSources: DataSources = compareDataSource<DataSource>(preDataSources, nextDataSources);
    // 将dataSource解析成标准的model
    const dataModels: Models = parseDataSource(dataSources);
    const keys: Array<string> = Object.keys(dataModels);
    const models = dva.getModels();
    app[preDataSourcesSymobol] = nextDataSources;
    keys.forEach(key => {
      const one = models.find(model => model.namespace === key);
      // 当前model不存在就直接放进去, 否则替换
      if (one) {
        dva.unmodel(one.namespace);
      }
      dva.model(dataModels[key]);
    });
  },
  /**
   * 负责将bindData中的定义的数据项目注入到组件当中
   * @param opt: bindDataSource string
   * 这里为了防止绑定数据时候的对象发生变化，所以讲 bindData转换成string，然后用memoize缓存，通过这个方法减少组件重绘次数
   * 问题，hot-loader无法替换该模块，因为模块被缓存了？？？
   */
  injectData: memoize(
    function(opt: BindDataSource) {
      if (!opt || isEmpty(opt)) {
        return SchemaRender;
      }
      const Com = connect(
        (state: any) => {
          const dataSourceKeys: Array<string> = Object.keys(opt);
          const data: { [dataSourceName: string]: any } = {};
          dataSourceKeys.reduce((result, key) => {
            if (state[key]) {
              if (opt[key] === true) {
                result[key] = state[key];
              } else if (Array.isArray(opt[key])) {
                const pickRes = pick(state[key], opt[key] as Array<string>);
                if (pickRes && !isEmpty(pickRes)) {
                  result[key] = pickRes;
                }
              }
            }
            return result;
          }, data);
          return {
            data,
          };
        },
        (dispatch: Dispatch) => {
          // 获取所有数据源的名称
          const dataSourceKeys = Object.keys(opt);
          // 取出所有models
          const models: Array<Model> = dva.getModels();
          // 取出effects
          const effectsResult: { [namespace: string]: { [effectsMethod: string]: (payload: PlainObject) => any } } = {};
          dataSourceKeys.reduce((results, namespace) => {
            const current = models.find((one: Model) => one.namespace === namespace);
            if (current) {
              const { effects = {} } = current;
              const { reducers = {} } = current;
              const namespaceMethod: PlainObject = {};
              Object.keys(reducers).reduce((res, key) => {
                const k: string = key.replace(`${namespace}/`, '');
                res[k] = function(payload: any) {
                  return dispatch({
                    type: key,
                    payload,
                  });
                };
                return res;
              }, namespaceMethod);
              Object.keys(effects).reduce((res, key) => {
                let k: string = key.replace(`${namespace}/`, '');
                k = k.slice(0, 1).toUpperCase() + k.slice(1);
                k = `fetch${k}`;
                res[k] = function(payload: any) {
                  return dispatch({
                    type: key,
                    payload,
                  });
                };
                return res;
              }, namespaceMethod);
              results[namespace] = namespaceMethod;
            }
            return results;
          }, effectsResult);
          return {
            effectsResult,
          };
        },
        (stateProps: any, dispatchProps: any, ownProps: any) => {
          const { data, ...otherState } = stateProps;
          const { effectsResult = {}, ...otherDispatch } = dispatchProps;
          const keys = Object.keys(data);
          keys.map(key => {
            data[key] = { ...data[key], ...effectsResult[key] };
          });
          return {
            data,
            ...otherDispatch,
            ...otherState,
            ...ownProps,
          };
        },
        {
          forwardRef: true,
          context: dvaReduxConnectContext,
        }
      )(SchemaRender);
      return Com;
    },
    {
      cache: {
        create() {
          return {
            has(key) {
              return key in memoizeCache;
            },
            get(key) {
              return memoizeCache[key];
            },
            set(key, value) {
              memoizeCache[key] = value;
            },
          };
        },
      },
    }
  ) as { (opt: BindDataSource): InjectConnect },
};

['register', 'unRegister', 'render', 'injectData'].map(key => {
  app[key] = app[key].bind(app);
});

export default app;

export const { register, unRegister, render, injectData, getData } = app;
