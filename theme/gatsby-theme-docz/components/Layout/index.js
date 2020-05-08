/* eslint-disable import/order */
/* eslint-disable import/no-unresolved */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
/** @jsx jsx */
import { useRef, useState } from 'react';
import { jsx, Layout as BaseLayout, Main, useThemeUI } from 'theme-ui';
import { Global } from '@emotion/core';
import '@mock';
import global from '~theme/global';
import { Header } from '~components/Header';
import { Sidebar } from '~components/Sidebar';
import { MainContainer } from '~components/MainContainer';
import AntdTheme from '../antdTheme';
import * as styles from './styles';

export const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const nav = useRef();
  const { colorMode } = useThemeUI();
  return (
    <BaseLayout sx={{ '& > div': { flex: '1 1 auto' } }} data-testid='layout'>
      <Global styles={global} />
      <Main sx={styles.main}>
        <Header onOpen={() => setOpen(s => !s)} />
        <AntdTheme colorMode={colorMode} />
        <div sx={styles.wrapper}>
          <Sidebar ref={nav} open={open} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen(false)} />
          <MainContainer data-testid='main-container'>{children}</MainContainer>
        </div>
      </Main>
    </BaseLayout>
  );
};
