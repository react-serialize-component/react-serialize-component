import React from 'react';
import { Tabs as AntdTabs } from 'antd';

type TabsType = 'line' | 'card' | 'editable-card';
type TabsPosition = 'top' | 'right' | 'bottom' | 'left';

const { TabPane } = AntdTabs;

interface TabsProps {
  activeKey?: string;
  defaultActiveKey?: string;
  hideAdd?: boolean;
  onChange?: (activeKey: string) => void;
  onTabClick?: Function;
  onPrevClick?: React.MouseEventHandler<HTMLElement>;
  onNextClick?: React.MouseEventHandler<HTMLElement>;
  tabBarExtraContent?: React.ReactNode | null;
  tabBarStyle?: React.CSSProperties;
  type?: TabsType;
  tabPosition?: TabsPosition;
  onEdit?: (targetKey: string | React.MouseEvent<HTMLElement>, action: 'add' | 'remove') => void;
  size?: 'large' | 'default' | 'small';
  style?: React.CSSProperties;
  prefixCls?: string;
  className?: string;
  animated?:
    | boolean
    | {
        inkBar: boolean;
        tabPane: boolean;
      };
  tabBarGutter?: number;
  renderTabBar?: (props: TabsProps, DefaultTabBar: React.ComponentClass<any>) => React.ReactElement<any>;
  destroyInactiveTabPane?: boolean;
  tabs?: Array<TabPaneProps> | TabPaneProps;
}

interface TabPaneProps {
  /** 选项卡头显示文字 */
  tab?: React.ReactNode | string;
  style?: React.CSSProperties;
  closable?: boolean;
  className?: string;
  disabled?: boolean;
  forceRender?: boolean;
  key?: string;
  content?: React.ReactNode | string;
}
export default class Tabs extends React.PureComponent<TabsProps, any> {
  renderPanel() {
    let { tabs } = this.props;
    if (!tabs) {
      return null;
    }
    if (!Array.isArray(tabs)) {
      tabs = [tabs];
    }
    return tabs.map((one: TabPaneProps, index: any) => {
      if (!one) {
        return null;
      }
      const { content, key, ...props } = one;
      return (
        <TabPane {...props} key={key || index}>
          {content}
        </TabPane>
      );
    });
  }

  render() {
    const { tabs, ...otherProps } = this.props;
    return <AntdTabs {...otherProps}>{this.renderPanel()}</AntdTabs>;
  }
}
