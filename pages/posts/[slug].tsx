import React, { useEffect } from "react";
import {
  getAllPostSlugs,
  getPostDetails,
  PostData,
  PostSlugs,
} from "../../lib/posts";
import { GetStaticPaths, GetStaticProps } from "next";
import Layout from "../../components/layout";
import Date from "../../components/date";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-kotlin";
import Head from "next/head";
import PostFooter from "./post-footer";
import Tag from "../../components/tag";

type Params = {
  slug: string;
};

type Props = {
  postDetails: PostDetails;
};

export type PostDetails = {
  [p: string]: any;
  prev: PostData | null;
  next: PostData | null;
  contentHtml: string;
  slug: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: PostSlugs = getAllPostSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async (
  context
) => {
  const params = context.params!;
  return {
    props: {
      postDetails: await getPostDetails(params.slug),
    },
  };
};

const Post = ({ postDetails }: PostDetails) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [postDetails]);

  return (
    <Layout>
      <Head>
        <title>{postDetails.title}</title>
        <meta property="og:title" content={postDetails.title} />
        <meta
          name="description"
          itemProp="description"
          property="og:description"
          content={postDetails.description}
        />
        {postDetails.image ? (
          <meta property="og:image" content={postDetails.image} />
        ) : null}
        <meta name="twitter:description" content={postDetails.description} />
        <meta
          property="og:url"
          content={`https://blog.sweller.de/posts/${postDetails.slug}`}
        />
      </Head>
      <article>
        <header>
          <h1>{postDetails.title}</h1>
          <Date dateString={postDetails.date} />
          <div className="tags">
            {postDetails.tags.map((tag: string) => (
              <Tag key={tag} text={tag} />
            ))}
          </div>
        </header>
        <div dangerouslySetInnerHTML={{ __html: postDetails.contentHtml }} />
      </article>

      <PostFooter prev={postDetails.prev} next={postDetails.next} />
    </Layout>
  );
};

export default Post;
