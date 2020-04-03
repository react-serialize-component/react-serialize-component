declare module 'dva-core' {
  import { Reducer, AnyAction, ReducersMapObject, Dispatch, MiddlewareAPI, StoreEnhancer } from 'redux';

  export interface EffectsCommandMap {
    put: <A extends AnyAction>(action: A) => any;
    call: Function;
    select: Function;
    take: Function;
    cancel: Function;
    [key: string]: any;
  }

  export type Effect = (action: AnyAction, effects: EffectsCommandMap) => void;
  export type EffectType = 'takeEvery' | 'takeLatest' | 'watcher' | 'throttle';
  export type EffectWithType = [Effect, { type: EffectType }];
  export type Subscription = (api: SubscriptionAPI, done: Function) => void;
  export type ReducersMapObjectWithEnhancer = [ReducersMapObject, ReducerEnhancer];
  export interface SubscriptionAPI {
    history: History;
    dispatch: Dispatch<any>;
  }
  export interface SubscriptionsMapObject {
    [key: string]: Subscription;
  }

  export interface EffectsMapObject {
    [key: string]: Effect | EffectWithType;
  }

  export interface Model {
    namespace: string;
    state?: any;
    reducers?: ReducersMapObject | ReducersMapObjectWithEnhancer;
    effects?: EffectsMapObject;
    subscriptions?: SubscriptionsMapObject;
  }

  export interface onActionFunc {
    (api: MiddlewareAPI<any>): void;
  }

  export interface ReducerEnhancer {
    (reducer: Reducer<any>): void;
  }

  export interface Hooks {
    onError?: (e: Error, dispatch: Dispatch<any>) => void;
    onAction?: onActionFunc | onActionFunc[];
    onStateChange?: () => void;
    onReducer?: ReducerEnhancer;
    onEffect?: () => void;
    onHmr?: () => void;
    extraReducers?: ReducersMapObject;
    extraEnhancers?: StoreEnhancer<any>[];
  }

  export interface dvaInstance {
    /**
     * Register an object of hooks on the application.
     *
     * @param hooks
     */
    use: (hooks: Hooks) => void;

    /**
     * Register a model.
     *
     * @param model
     */
    model: (model: Model) => void;

    /**
     * Unregister a model.
     *
     * @param namespace
     */
    unmodel: (namespace: string) => void;

    /**
     * Start the application. Selector is optional. If no selector
     * arguments, it will return a function that return JSX elements.
     *
     * @param selector
     */
    start: () => any;
  }
  export type opt = Hooks & {
    initialState?: Object;
    models?: Array<Model>;
  };
  export interface createOpt {
    initialReducer?: Object;
    setupMiddlewares?(middlewares: Array<{ (...rest: any): any }>): any;
    setupApp?(app: dvaInstance): any;
  }

  export function create(opt?: opt, createOpt?: createOpt): dvaInstance;
}

declare module 'dva-loading' {
  export interface opt {
    namespace?: string;
  }
  export default function createLoading(
    opt?: opt
  ): {
    extraReducers?: any;
    onEffect?: any;
  };
}
