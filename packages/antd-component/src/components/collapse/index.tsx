import React from 'react';
import { Collapse as AntdCollapse } from 'antd';

type ExpandIconPosition = 'left' | 'right';

interface CollapseProps {
  activeKey?: Array<string | number> | string | number;
  defaultActiveKey?: Array<string | number> | string | number;
  /** 手风琴效果 */
  accordion?: boolean;
  destroyInactivePanel?: boolean;
  onChange?: (key: string | string[]) => void;
  style?: React.CSSProperties;
  className?: string;
  bordered?: boolean;
  prefixCls?: string;
  expandIcon?: (panelProps: PanelProps) => React.ReactNode;
  expandIconPosition?: ExpandIconPosition;
  panel?: Array<PanelProps> | PanelProps;
}
interface PanelProps {
  isActive?: boolean;
  header: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  forceRender?: boolean;
  disabled?: boolean;
  extra?: React.ReactNode;
  content?: React.ReactNode;
  key?: string;
}

export default class Collapse extends React.PureComponent<CollapseProps, any> {
  renderPanel() {
    let { panel } = this.props;
    if (!panel) {
      return null;
    }
    if (!Array.isArray(panel)) {
      panel = [panel];
    }
    return panel.map((one: PanelProps, index) => {
      if (!one) {
        return null;
      }
      const { content, key, ...props } = one;
      return (
        <AntdCollapse.Panel {...props} key={key || index}>
          {content}
        </AntdCollapse.Panel>
      );
    });
  }

  render() {
    const { panel, ...otherProps } = this.props;
    return <AntdCollapse {...otherProps}>{this.renderPanel()}</AntdCollapse>;
  }
}
