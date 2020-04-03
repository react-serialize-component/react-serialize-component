import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { render, register } from '../src/index';
import '../src/utils';

function Page(props: any) {
  return (
    <div>
      <p>title: {props.title}</p>
      <div>{props.content}</div>
    </div>
  );
}
class Tpl extends React.PureComponent<any, any> {
  componentDidMount() {
    console;
  }
  createMarkup() {
    return { __html: this.props.tpl || '' };
  }
  render() {
    return <div dangerouslySetInnerHTML={this.createMarkup()}></div>;
  }
}
register('page', Page);
register('tpl', Tpl);

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
  title: '${page.list.a}',
  content: {
    type: 'tpl',
    tpl: '${page|json}',
    bindData: {
      page: true,
    },
  },
};

@hot
class App extends React.PureComponent {
  state = {
    schema: schema,
  };
  componentDidMount() {
    console.log(this);
  }
  render() {
    return <div>{render(this.state.schema)}</div>;
  }
}

ReactDOM.render(<App />, window.document.getElementById('app'));
