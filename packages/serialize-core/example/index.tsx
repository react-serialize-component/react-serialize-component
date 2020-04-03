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
register('page', Page);
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
    type: 'layout',
    children: [
      {
        type: 'header',
        children: 'test',
      },
      {
        type: 'content',
        children: {
          $type: 'button',
          children: 'test button',
          type: 'primary',
        },
      },
    ],
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
