import React from "react";
import Link from "next/link";
import Date from "../components/date";
import Layout from "../components/layout";
import { PostData, sortedPostData } from "../lib/posts";

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
          {sortedPostData.map(({ slug, title, date }: PostData) => (
            <li key={slug}>
              <Link href={`/posts/${slug}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
};

export default Index;
