import React from "react";
import Layout from "../../components/layout";
import {
  getAllTagsSlugs,
  getPostsByTag,
  PostData,
  tags,
} from "../../lib/posts";
import PostLink from "../../components/post-link";
import Date from "../../components/date";
import { GetStaticPaths, GetStaticProps } from "next";
import Tag from "../../components/tag";

type Params = {
  tag: string;
};

type Props = {
  sortedPostData: PostData[];
  tag: string;
  tags: string[];
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getAllTagsSlugs(),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async (
  context
) => {
  const params = context.params!;
  return {
    props: {
      sortedPostData: await getPostsByTag(params.tag),
      tag: params.tag,
      tags,
    },
  };
};

const TagPage = ({ sortedPostData, tag, tags }: Props) => {
  return (
    <Layout>
      <section>
        <h1 className="h2">All posts tagged with: {tag}</h1>
        <ul className="post-list">
          {sortedPostData.map((postData: PostData) => (
            <li key={postData.slug}>
              <PostLink {...postData} />
              <br />
              <small>
                <Date dateString={postData.date} />
              </small>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>All tags</h2>
        <div className="tags">
          {tags.map((tag: string) => (
            <Tag key={tag} text={tag} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default TagPage;
