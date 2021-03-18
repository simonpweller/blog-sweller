import PostLink from "../../components/post-link";
import React from "react";
import { PostData } from "../../lib/posts";

const PostFooter = (props: {
  prev: PostData | null;
  next: PostData | null;
}) => (
  <footer>
    {props.prev ? (
      <p>
        Previous post: <PostLink {...props.prev} />
      </p>
    ) : null}
    {props.next ? (
      <p>
        Next post: <PostLink {...props.next} />
      </p>
    ) : null}
  </footer>
);

export default PostFooter;
