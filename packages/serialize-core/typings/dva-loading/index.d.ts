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
