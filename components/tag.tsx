import React from "react";
import Link from "next/link";

const Tag = ({ text }: { text: string }) => {
  return (
    <Link href={`/tags/${text}`}>
      <a className="tag">{text}</a>
    </Link>
  );
};

export default Tag;
