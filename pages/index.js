/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from 'theme-ui'
import Head from 'next/head';
// import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1
        //@ts-ignore
          sx={{
            fontWeight: "bold",
            fontSize: 4, // picks up value from `theme.fontSizes[4]`
            color: "primary", // picks up value from `theme.colors.primary`
          }}
        >
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
      </main>

      <footer />
    </div>
  );
}
