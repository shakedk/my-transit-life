import { ThemeProvider } from 'theme-ui'
import theme from '../styles/theme'

import './main.css'
import Head from 'next/head';
import { AppWrapper } from '../src/context/state'; // import based on where you put it

function MyApp({ Component, pageProps }) {
  return (
    <AppWrapper>
      <Head>
        <link
          rel="preload"
          href="/fonts/johnston-itc-std-bold.otf"
          as="font"
          crossOrigin=""
        />
      </Head>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </AppWrapper>
  );
}

export default MyApp
