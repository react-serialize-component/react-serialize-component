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
import { useConfig, useComponentProps } from 'docz';
import Clipboard from 'react-feather/dist/icons/clipboard';
import CodeIcon from 'react-feather/dist/icons/code';
import { Wrapper } from './Wrapper';
import { usePrismTheme } from '~utils/theme';
import * as styles from './styles';

const transformCode = code => {
  // if (code.startsWith('()') || code.startsWith('class')) return `/** @jsx mdx */${code}`;
  // return `/** @jsx mdx */<React.Fragment>${code}</React.Fragment>`;
  return `
    /**@jsx mdx */${code}
  `;
};

export const Code = ({ children, className: outerClassName, live, render, schema, noInline = false }) => {
  const [language] = outerClassName ? outerClassName.replace(/language-/, '').split(' ') : ['text'];
  const {
    themeConfig: { showPlaygroundEditor, showLiveError },
  } = useConfig();
  const ScopeContext = useMDXScope();
  const [scopeOnMount] = React.useState({ ...ScopeContext, mdx });
  const theme = usePrismTheme();
  const [showingCode, setShowingCode] = React.useState(showPlaygroundEditor);

  const copyCode = () => copy(children.trim());
  const toggleCode = () => setShowingCode(s => !s);
  if (noInline === 'false') {
    noInline = false;
  }
  if (live) {
    return (
      <LiveProvider code={children.trim()} scope={scopeOnMount} transformCode={transformCode} theme={theme} noInline={noInline}>
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
  if (render) {
    return (
      <LiveProvider code={children} theme={theme} scope={scopeOnMount}>
        <Wrapper content='preview' useScoping={false} showingCode={showingCode}>
          <LivePreview sx={styles.preview} />
        </Wrapper>
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
