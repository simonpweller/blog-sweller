import React from "react";
import Head from "next/head";

const Layout = ({ children }: { children: any }) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/images/favicon.ico" />
        <title>Simon's blog</title>
        <meta property="og:title" content="Simon's blog" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@simonpweller" />
        <meta property="og:url" content="https://blog.sweller.de" />
      </Head>
      <main>{children}</main>
    </>
  );
};

export default Layout;
