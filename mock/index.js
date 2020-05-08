import Mock from 'mockjs';
import mockFetch from 'mockjs-fetch';
mockFetch(Mock);

Mock.setup({
  timeout: '200-400', // mockFetch支持 mockjs 已有的 timeout 设置项
  debug: true, // mockFetch新增的设置项，如果开启，请求时会打印一些日志
});

// Mock响应模板
Mock.mock(/test1/, {
  code: 10000,
  message: '',
  data: {
    'user|1': [
      {
        // 随机生成1到3个数组元素
        name: '@cname', // 中文名称
        'id|+1': 88, // 属性值自动加 1，初始值为88
        'age|18-28': 0, // 18至28以内随机整数, 0只是用来确定类型
        birthday: '@date("yyyy-MM-dd")', // 日期
        city: '@city(true)', // 中国城市
      },
      {
        gf: '@cname',
      },
    ],
  },
});
