/* eslint-disable react/no-danger */
import React from 'react';

interface TplProps {
  tpl: string;
}

export default class Tpl extends React.PureComponent<TplProps, any> {
  createMarkup() {
    const { tpl } = this.props;
    return { __html: tpl || '' };
  }

  render() {
    return (
      <div>
        <div dangerouslySetInnerHTML={this.createMarkup()} />
      </div>
    );
  }
}
