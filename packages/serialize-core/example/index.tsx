import { hot } from 'react-hot-loader/root';
import React from 'react';
import ReactDOM from 'react-dom';
import { render, register } from '../src/index';
import '../src/utils';

function Page(props: any) {
  const { title, content } = props;
  return (
    <div>
      <p>title: {title}</p>
      <div>{content}</div>
    </div>
  );
}

function Content(props: any) {
  const { children, ...other } = props;
  return <div {...other}>{children}</div>;
}
class Tpl extends React.PureComponent<any, any> {
  createMarkup() {
    const { tpl } = this.props;
    return { __html: tpl || '' };
  }

  render() {
    return <div dangerouslySetInnerHTML={this.createMarkup()} />; /* eslint-disable-line */
  }
}
register('page', Page);
register('tpl', Tpl);
register('content', Content);

// Object.keys(antd).forEach(key => {
//   const name = key.slice(0, 1).toLowerCase() + key.slice(1);
//   register(name, (antd as any)[key]);
// });
// const { Header, Content, Footer, Sider } = antd.Layout;
// register('header', Header);
// register('content', Content);
// register('footer', Footer);
// register('sider', Sider);

// import * as antd from 'antd';
// import 'antd/dist/antd.css';

const schema = {
  type: 'page',
  DataSource: {
    page: {
      list: '/api/test/2',
    },
  },
  bindData: {
    page: true,
    tpl: ['list'],
  },
  title: 'abc1',
  content: {
    type: 'content',
    bindData: {
      page: true,
    },
    children: [
      {
        type: 'tpl',
        tpl: '${page|json}',
        onInit: '${page.fetchList()}',
        bindData: {
          page: true,
        },
      },
      {
        type: 'content',
        onClick: '${env.alert("abc")}',
        children: 'abc',
      },
    ],
  },
};

@hot
class App extends React.PureComponent<any, { schema: any }> {
  constructor(props: any) {
    super(props);
    this.state = {
      schema,
    };
  }

  componentDidMount() {
    console.log(this);
  }

  render() {
    const { schema: config } = this.state;
    return <div>{render(config)}</div>;
  }
}

ReactDOM.render(<App />, window.document.getElementById('app'));
