/* eslint-disable import/no-webpack-loader-syntax */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
import React from 'react';
import css from '!css-loader!antd/dist/antd.css';
import darkCss from '!css-loader!./antd.dark.css';

export default class AntdTheme extends React.PureComponent {
  static defaultProps = {
    colorMode: 'light',
  };

  componentDidMount() {
    this.changeColor();
  }

  componentDidUpdate() {
    this.changeColor();
  }

  componentWillUnmount() {
    const antdStyle = document.head.querySelector('#antdStyle');
    if (antdStyle) {
      document.head.removeChild(antdStyle);
    }
  }

  changeColor() {
    const { colorMode } = this.props;
    let antdStyle = document.head.querySelector('#antdStyle');
    if (antdStyle) {
      document.head.removeChild(antdStyle);
    }
    antdStyle = document.createElement('style');
    antdStyle.id = 'antdStyle';
    this.antdStyle = antdStyle;
    antdStyle.innerText = colorMode === 'light' ? css.toString() : darkCss.toString();
    document.head.appendChild(antdStyle);
  }

  render() {
    const { children } = this.props;
    return children || null;
  }
}
