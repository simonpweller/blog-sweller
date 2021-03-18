import React from "react";
import Date from "../components/date";
import Layout from "../components/layout";
import { PostData, sortedPostData } from "../lib/posts";
import PostLink from "../components/post-link";

export async function getStaticProps() {
  return {
    props: {
      sortedPostData,
    },
  };
}

const Index = ({ sortedPostData }: { sortedPostData: PostData[] }) => {
  return (
    <Layout>
      <section>
        <h1>
          Hey, I'm Simon, a web developer passionate about testing and code
          quality. This is my blog.
        </h1>
      </section>

      <section>
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
    </Layout>
  );
};

export default Index;
