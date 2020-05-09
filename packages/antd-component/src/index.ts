import Core from '@react-serialize-component/core';
import './env';
import { Button, Icon, Divider, Row, Col } from 'antd';
import { PlainObject } from '@react-serialize-component/core/lib/types';
import Tpl from './components/tpl';
import Page from './components/page';
import Collapse from './components/collapse';

export default Core;
export { Tpl };

const components: PlainObject = {
  tpl: Tpl,
  page: Page,
  button: Button,
  collapse: Collapse,
  icon: Icon,
  divider: Divider,
  row: Row,
  col: Col,
};

Object.keys(components).forEach(key => Core.register(key, components[key]));
