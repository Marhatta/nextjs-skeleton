import { Provider } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { wrapper } from '../redux/store';
import { VuroxContextProvider } from '../context';

import 'antd/dist/antd.less';
import '../styles/globals.css';
import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '../styles/styles.less';

function VuroxApp({ Component, pageProps, store }) {
  const [windowWidth, setWindowWidth] = useState(undefined);
  useEffect(() => {
    const isClient = typeof window === 'object';
    const width = isClient ? window.innerWidth : undefined;
    setWindowWidth(width);
  }, []);
  return (
    <Provider store={store}>
      <VuroxContextProvider pageWidth={windowWidth}>
        <Component {...pageProps} />
      </VuroxContextProvider>
    </Provider>
  );
}

export default wrapper.withRedux(configureStore)(VuroxApp);
