import React from "react";
import Head from "next/head";

const Layout = ({ children }: { children: any }) => {
  return (
    <>
      <Head>
        <title>Simon's blog</title>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <main>{children}</main>
    </>
  );
};

export default Layout;
