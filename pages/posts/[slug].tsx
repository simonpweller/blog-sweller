import React from "react";
import { getAllPostSlugs, getPostData, PostSlugs } from "../../lib/posts";
import { GetStaticPaths, GetStaticProps } from "next";
import Layout from "../../components/layout";
import Date from "../../components/date";

type Params = {
  slug: string;
};

type Props = {
  postData: PostData;
};

type PostData = {
  [p: string]: any;
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
      postData: await getPostData(params.slug),
    },
  };
};

const Post = ({ postData }: PostData) => {
  return (
    <Layout>
      <article>
        <h1>{postData.title}</h1>
        <Date dateString={postData.date} />
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
};

export default Post;
