import moment from 'moment';
import template from './art';
import { escapeHtml, prettyBytes } from '../utils';

const endWith = /(.*)}$/;
// 过滤器，在模板中使用
template.defaults.imports = {
  ...template.defaults.imports,
  boolean(input: string) {
    if (input === undefined || input === null) {
      return false;
    }
    if (input.toLowerCase() === 'true') {
      return true;
    }
    if (input.toLowerCase() === 'false') {
      return true;
    }
    return !!input;
  },
  html: (input: string) => escapeHtml(input),
  json: (input: any, tabSize: number | string = 2) => (tabSize ? JSON.stringify(input, null, parseInt(tabSize as string, 10)) : JSON.stringify(input)),
  toJson: (input: any) => {
    let ret;
    try {
      ret = JSON.parse(input);
    } catch (e) {
      ret = null;
    }
    return ret;
  },
  raw: (input: any) => input,
  date: (input: any, format = 'LLL', inputFormat = 'X') => moment(input, inputFormat).format(format),
  number: (input: any) => {
    const parts = String(input).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },
  trim: (input: any) => input.trim(),
  percent: (input: any, decimals: any = 0) => {
    input = parseFloat(input) || 0;
    decimals = parseInt(decimals, 10) || 0;

    const whole = input * 100;
    const multiplier = 10 ** decimals;

    return `${(Math.round(whole * multiplier) / multiplier).toFixed(decimals)}%`;
  },
  bytes: (input: any) => (input ? prettyBytes(parseFloat(input)) : input),
  round: (input: any, decimals: any = 0) => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(input)) {
      return 0;
    }

    decimals = parseInt(decimals, 10) || 2;

    const multiplier = 10 ** decimals;
    return (Math.round(input * multiplier) / multiplier).toFixed(decimals);
  },
  truncate: (input: any, length: any, end: any) => {
    end = end || '...';

    if (length == null) {
      return input;
    }

    length = parseInt(length, 10) || 200;

    return input.substring(0, length) + (input.length > length ? end : '');
  },
  encodeURIComponent: (input: any) => encodeURIComponent(input),
  decodeURIComponent: (input: any) => decodeURIComponent(input),
  default: (input: any, defaultValue: any) =>
    input ||
    (() => {
      try {
        if (defaultValue === 'undefined') {
          return undefined;
        }

        return JSON.parse(defaultValue);
      } catch (e) {
        return defaultValue;
      }
    })(),
  join: (input: any, glue: any) => (input && input.join ? input.join(glue) : input),
  split: (input: any, delimiter = ',') => (typeof input === 'string' ? input.split(delimiter) : input),
  first: (input: any) => input && input[0],
  nth: (input: any, nth = 0) => input && input[nth],
  last: (input: any) => input && (input.length ? input[input.length - 1] : null),
  minus: (input: any, step: any = 1) => (parseInt(input, 10) || 0) - parseInt(step, 10),
  plus: (input: any, step: any = 1) => (parseInt(input, 10) || 0) + parseInt(step, 10),
  asArray: (input: any) => (Array.isArray(input) ? input : input ? [input] : input),

  base64Encode(str: any) {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
        return String.fromCharCode(`0x${p1}` as any);
      })
    );
  },
  base64Decode(str: any) {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map(function mp(c) {
          return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
        })
        .join('')
    );
  },
  lowerCase: (input: any) => (input && typeof input === 'string' ? input.toLowerCase() : input),
  upperCase: (input: any) => (input && typeof input === 'string' ? input.toUpperCase() : input),
};

// 增加es6 template的规则？？
/**
 * 简洁模板语法规则
 */
const rule = {
  test: /\${([@]?)[ \t]*(\/?)([\w\W]*?)[ \t]*(}+)/,
  use(match: any, raw: any, close: any, code: any, end: any) {
    const r = end.match(endWith);
    code += r ? r[1] : null;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const compiler: any = this;
    const { options } = compiler;
    const esTokens = compiler.getEsTokens(code);
    const values = esTokens.map((token: any) => token.value);
    const result: any = {};

    let group;
    let output = raw ? 'raw' : false;
    const key = close + values.shift();

    switch (key) {
      case 'set':
        code = `var ${values.join('').trim()}`;
        break;

      case 'if':
        code = `if(${values.join('').trim()}){`;

        break;

      case 'else': {
        const indexIf = values.indexOf('if');

        if (~indexIf) {
          values.splice(0, indexIf + 1);
          code = `}else if(${values.join('').trim()}){`;
        } else {
          code = `}else{`;
        }

        break;
      }

      case '/if':
        code = '}';
        break;

      case 'each': {
        group = rule._split(esTokens);
        group.shift();
        const object = group[0] || '$data';
        const value = group[1] || '$value';
        const index = group[2] || '$index';
        code = `$each(${object},function(${value},${index}){`;
        break;
      }
      case '/each':
        code = '})';
        break;
      case 'block':
        group = rule._split(esTokens);
        group.shift();
        code = `block(${group.join(',').trim()},function(){`;
        break;
      case '/block':
        code = '})';
        break;
      case 'print':
      case 'include':
      case 'extend':
        if (
          values
            .join('')
            .trim()
            .indexOf('(') !== 0
        ) {
          // 执行函数省略 `()` 与 `,`
          group = rule._split(esTokens);
          group.shift();
          code = `${key}(${group.join(',')})`;
          break;
        }

      // eslint-disable-next-line no-fallthrough
      default:
        if (~values.indexOf('|')) {
          // 将过滤器解析成二维数组
          const groupAll = esTokens
            .reduce((one: any, token: any) => {
              const { value, type } = token;
              if (value === '|') {
                one.push([]);
              } else if (type !== `whitespace` && type !== `comment`) {
                if (!one.length) {
                  one.push([]);
                }
                one[one.length - 1].push(token);
              }
              return one;
            }, [])
            .map((g: any) => rule._split(g));

          // 将过滤器管道化
          code = groupAll.reduce(
            (accumulator: any, filter: any) => {
              const name = filter.shift();
              filter.unshift(accumulator);

              return `$imports.${name}(${filter.join(',')})`;
            },
            groupAll
              .shift()
              .join(` `)
              .trim()
          );
        }

        output = output || 'escape';

        break;
    }

    result.code = code;
    result.output = output;

    return result;
  },

  // 将多个 javascript 表达式拆分成组
  // 支持基本运算、三元表达式、取值、运行函数，不支持 `typeof value` 操作
  // 只支持 string、number、boolean、null、undefined 这几种类型声明，不支持 function、object、array
  _split: (esTokens: any) => {
    esTokens = esTokens.filter(({ type }: any) => {
      return type !== `whitespace` && type !== `comment`;
    });

    let current = 0;
    let lastToken = esTokens.shift();
    const punctuator = `punctuator`;
    const close = /\]|\)/;
    const group = [[lastToken]];

    while (current < esTokens.length) {
      const esToken = esTokens[current];

      if (esToken.type === punctuator || (lastToken.type === punctuator && !close.test(lastToken.value))) {
        group[group.length - 1].push(esToken);
      } else {
        group.push([esToken]);
      }

      lastToken = esToken;

      current += 1;
    }

    return group.map(one => one.map(g => g.value).join(``));
  },
};

template.defaults.rules.push(rule);

// 单个表达式的模板原值返回
template.defaults.singleExpression = true;
template.defaults.escape = false;
