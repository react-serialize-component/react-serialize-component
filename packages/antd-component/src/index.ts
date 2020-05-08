import Core from '@react-serialize-component/core';
import { Button } from 'antd';
import Tpl from './components/tpl';
import Page from './components/page';

export default Core;
export { Tpl };

Core.register('tpl', Tpl);
Core.register('page', Page);
Core.register('button', Button);
