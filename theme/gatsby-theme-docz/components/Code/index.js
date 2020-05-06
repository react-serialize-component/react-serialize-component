/** @jsx jsx */

/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint react/jsx-key: 0 */
import Highlight, { defaultProps } from 'prism-react-renderer';
import { Styled, jsx } from 'theme-ui';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { mdx } from '@mdx-js/react';
import copy from 'copy-text-to-clipboard';
import React from 'react';
import { useMDXScope } from 'gatsby-plugin-mdx/context.js';
import { useConfig } from 'docz';
import Clipboard from 'react-feather/dist/icons/clipboard';
import CodeIcon from 'react-feather/dist/icons/code';
import AntdCore from '@react-serialize-component/antd';
// import WapCore from '@react-serialize-component/wap';
import { Wrapper } from './Wrapper';
import { usePrismTheme } from '~utils/theme';
import * as styles from './styles';

const transformCode = code => {
  return `
    /**@jsx mdx */
    ${code}
  `;
};
const transformJSONCode = jsonStr => {
  return `
    /**@jsx mdx */
    return render(AntdCore.render(${jsonStr}));
  `;
};

export const Code = ({ children, className: outerClassName, live, schema, wap = false, noInline = false }) => {
  const [language] = outerClassName ? outerClassName.replace(/language-/, '').split(' ') : ['text'];
  const {
    themeConfig: { showPlaygroundEditor, showLiveError },
  } = useConfig();
  const ScopeContext = useMDXScope();
  const [scopeOnMount] = React.useState({ ...ScopeContext, mdx, AntdCore });
  const theme = usePrismTheme();
  const [showingCode, setShowingCode] = React.useState(showPlaygroundEditor);

  const copyCode = () => copy(children.trim());
  const toggleCode = () => setShowingCode(s => !s);
  if (noInline === 'false') {
    noInline = false;
  }
  if (schema) {
    noInline = true;
  }
  if ((live && language === 'jsx') || (language === 'json' && schema)) {
    return (
      <LiveProvider code={children.trim()} scope={scopeOnMount} transformCode={language === 'json' ? transformJSONCode : transformCode} theme={theme} noInline={noInline}>
        <div sx={styles.previewWrapper}>
          <Wrapper content='preview' useScoping={false} showingCode={showingCode}>
            <LivePreview sx={styles.preview} data-testid='live-preview' />
          </Wrapper>
          <div sx={styles.buttons}>
            <button sx={styles.button} onClick={copyCode}>
              <Clipboard size={12} />
            </button>
            <button sx={styles.button} onClick={toggleCode}>
              <CodeIcon size={12} />
            </button>
          </div>
        </div>
        {showingCode && (
          <Wrapper content='editor' useScoping={false} showingCode={showingCode}>
            <div sx={styles.editor(theme)}>
              <LiveEditor data-testid='live-editor' />
            </div>
          </Wrapper>
        )}
        {showLiveError ? <LiveError /> : null}
      </LiveProvider>
    );
  }
  return (
    <Highlight {...defaultProps} code={children.trim()} language={language} theme={theme}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Styled.pre className={`${outerClassName || ''} ${className}`} style={{ ...style, overflowX: 'auto' }} data-testid='code'>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} sx={{ display: 'inline-block' }} />
              ))}
            </div>
          ))}
        </Styled.pre>
      )}
    </Highlight>
  );
};

/**
 * render demo
 * ```jsx live=true noInline=true
        function Page(props) {
          const { title, content } = props;
          return (
            <div>
              <p>title: {title}</p>
              <div>{content}</div>
            </div>
          );
        }
        class Tpl extends React.PureComponent {
          createMarkup() {
            const { tpl } = this.props;
            return { __html: tpl || '' };
          }

          render() {
            return <div dangerouslySetInnerHTML={this.createMarkup()} />;
          }
        }
        const schema = {
          type: 'page',
          DataSource: {
            page: {
              data: { title: 'test' },
            },
          },
          bindData: {
            page: true,
          },
          title: '${page.title}',
          content: {
            type: 'tpl',
            tpl: '<div>test</div>',
          },
        };
        AntdCore.register('page', Page);
        AntdCore.register('tpl', Tpl);
        console.log(AntdCore);
        render(<div>{AntdCore.render(schema)}</div>);
      ```
 */
