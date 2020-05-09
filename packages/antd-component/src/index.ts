import Core from '@react-serialize-component/core';
import './env';
import { Button } from 'antd';
import Tpl from './components/tpl';
import Page from './components/page';
import Collapse from './components/collapse';

export default Core;
export { Tpl };

Core.register('tpl', Tpl);
Core.register('page', Page);
Core.register('button', Button);
Core.register('collapse', Collapse);
