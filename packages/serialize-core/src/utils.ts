import { PlainObject } from './types';
import isPlainObject from 'lodash/isPlainObject';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export const prettyBytes = (num: number) => {
  if (!Number.isFinite(num)) {
    throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`);
  }

  const neg = num < 0;

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), UNITS.length - 1);
  const numStr = Number((num / Math.pow(1000, exponent)).toPrecision(3));
  const unit = UNITS[exponent];

  return (neg ? '-' : '') + numStr + ' ' + unit;
};

export function anyChanged(pre: PlainObject, next: PlainObject) {
  const loopList = [[pre, next]];
  while (loopList.length) {
    const [one, two] = loopList.pop() as Array<PlainObject>;
    const key1 = Object.keys(one);
    let key1Map: PlainObject = {};
    key1.reduce((res, cur) => {
      res[cur] = cur;
      return res;
    }, key1Map);

    const key2 = Object.keys(two);
    // 对比字段数目是否相同
    if (key1.length !== key2.length) {
      return true;
    }
    // 对比key是否相同
    if (key2.some(key => !key1Map[key])) {
      return true;
    }

    for (let key in one) {
      const val1 = one[key];
      const val2 = two[key];
      const tval1 = typeof val1;
      const tval2 = typeof val2;
      if (tval1 !== tval2) {
        return true;
      } else if (isPlainObject(val1) && isPlainObject(val2)) {
        loopList.push([val1, val2]);
      } else if (Array.isArray(val1) && Array.isArray(val2)) {
        // 数组，只处理长度，和内部值按顺序进行对比
        return val1.length !== val2.length || val1.some((cur, index) => cur !== val2[index]);
      } else if (val1 !== val2) {
        return true;
      }
    }
  }
  return false;
}

const entityMap: {
  [propName: string]: string;
} = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};
export const escapeHtml = (str: string) =>
  String(str).replace(/[&<>"'\/]/g, function(s) {
    return entityMap[s];
  });

export function createFunction(js: string): any {
  const fn = new Function(`${/^\s*return\b/.test(js) ? '' : 'return '}${js};`);
  return fn;
}

const isEvtReg: RegExp = /^on[A-Z]+.*/;
// 是一个事件?? onClick
export function isEventString(str: string | null | undefined) {
  return str && isEvtReg.test(str);
}

const isExpressStr: RegExp = /^(?:\${|<%|{{).+(?:}}|}|%>)$/;
// 是一个独立的表达式 ？？${a} {{a}} <%=a%>
export function isExpressionStr(str: string | null | undefined) {
  return str && isExpressStr.test(str);
}

const isTemplateReg: RegExp = /(?:\${|<%|{{).+(?:}}|}|%>)/;
export function isTplStr(str: string | null | undefined) {
  return str && isTemplateReg.test(str);
}
