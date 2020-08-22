import React from 'react';
import { ReactQueryDevtools } from 'react-query-devtools';
import { UserContextProvider } from '../components/UserContext';

function MyApp({ Component, pageProps }) {
  return (
    <UserContextProvider>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen />
    </UserContextProvider>
  );
}

export default MyApp;
