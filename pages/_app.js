import { ThemeProvider } from 'theme-ui'
import theme from '../styles/theme'
import '../components/stopLabel.css';
import './main.css'
import Head from 'next/head';


function MyApp({ Component, pageProps }) {
  return (
    <>
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
    </>
  );
}

export default MyApp
