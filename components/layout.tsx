import React from "react";
import Head from "next/head";

const Layout = ({ children }: { children: any }) => {
  return (
    <>
      <Head>
        <title>Simon's blog</title>
        <link rel="icon" href="/images/favicon.ico" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@simonpweller" />
        <meta
          property="og:image"
          content="https://blog.sweller.de/images/headshot.png"
        />
      </Head>
      <main>{children}</main>
    </>
  );
};

export default Layout;
