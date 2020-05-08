/* eslint-disable import/no-webpack-loader-syntax */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
import React from 'react';
import css from '!css-loader!antd/dist/antd.css';

export default class AntdTheme extends React.PureComponent {
  static defaultProps = {
    colorMode: 'light',
  };

  componentDidMount() {
    const { colorMode } = this.props;
    let antdStyle = document.querySelector('#antdStyle');
    if (!antdStyle) {
      antdStyle = document.createElement('style');
      antdStyle.id = antdStyle;
    }
    antdStyle.innerText = css.toString();
    document.head.appendChild(antdStyle);
  }

  componentDidUpdate() {
    const { colorMode } = this.props;
    console.log('colorMode', colorMode);
  }

  render() {
    const { children } = this.props;
    return children || null;
  }
}
