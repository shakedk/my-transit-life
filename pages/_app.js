import { ThemeProvider } from 'theme-ui'
import theme from '../styles/theme'
import '../components/stopLabel.css';
import './main.css'


function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp
