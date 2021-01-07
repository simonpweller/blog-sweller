import React from "react";
import Link from "next/link";
import Date from "../components/date";
import Layout from "../components/layout";
import { getSortedPostsData, PostData } from "../lib/posts";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

const Index = ({ allPostsData }: { allPostsData: PostData[] }) => {
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
          {allPostsData.map(({ slug, title, date }: PostData) => (
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
