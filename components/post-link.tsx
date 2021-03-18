import Link from "next/link";
import React from "react";
import { PostData } from "../lib/posts";

const PostLink = (props: PostData) => (
  <Link href={`/posts/${props.slug}`}>
    <a>{props.title}</a>
  </Link>
);

export default PostLink;
