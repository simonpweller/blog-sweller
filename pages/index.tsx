import React from "react";
import Date from "../components/date";
import Layout from "../components/layout";
import { PostData, sortedPostData, tags } from "../lib/posts";
import PostLink from "../components/post-link";
import Tag from "../components/tag";

export async function getStaticProps() {
  return {
    props: {
      sortedPostData,
      tags,
    },
  };
}

type IndexProps = {
  sortedPostData: PostData[];
  tags: string[];
};
const Index = ({ sortedPostData, tags }: IndexProps) => {
  return (
    <Layout>
      <section>
        <h1>
          Hey, I'm Simon, a web developer passionate about testing and code
          quality. This is my blog.
        </h1>
      </section>

      <section>
        <h2>Latest posts</h2>
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
        <h2>Tags</h2>
        {tags.map((tag: string) => (
          <Tag key={tag} text={tag} />
        ))}
      </section>
    </Layout>
  );
};

export default Index;
