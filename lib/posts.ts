import fs from "fs";
import path from "path";
import remark from "remark";
import externalLinks from "remark-external-links";
import matter from "gray-matter";
import html from "remark-html";
import { PostDetails } from "../pages/posts/[slug]";

const postsDirectory = path.join(process.cwd(), "posts");

export type PostSlugs = { params: { slug: string } }[];
export type TagSlugs = { params: { tag: string } }[];
export type PostData = {
  slug: string;
  date: string;
  title: string;
  tags: string[];
};
type PostIndices = { [slug: string]: number };

export const sortedPostData: PostData[] = getSortedPostData();
export const tags: string[] = Array.from(
  sortedPostData.reduce<Set<string>>((acc, curr) => {
    curr.tags.forEach((tag) => acc.add(tag));
    return acc;
  }, new Set())
);
const postIndices: PostIndices = getPostIndices();

export const getPostsByTag: (tag: string) => PostData[] = (tag) => {
  return sortedPostData.filter((post) => post.tags.includes(tag));
};
export const getAllTagsSlugs = (): TagSlugs =>
  tags.map((tag) => ({
    params: {
      tag,
    },
  }));

export const getAllPostSlugs = (): PostSlugs => {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName: string) => ({
    params: {
      slug: fileName.replace(".md", ""),
    },
  }));
};

export const getPostDetails: (slug: string) => Promise<PostDetails> = async (
  slug: string
) => {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .use(externalLinks)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  const postIndex = postIndices[slug];
  const prev = sortedPostData[postIndex - 1] ?? null;
  const next = sortedPostData[postIndex + 1] ?? null;

  return {
    slug,
    contentHtml,
    prev,
    next,
    ...matterResult.data,
    tags: matterResult.data.tags?.split(",") ?? [],
  };
};

function getSortedPostData(): PostData[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData: PostData[] = fileNames.map(readPostData);
  return allPostsData.sort(dateSort);
}

function getPostIndices() {
  return sortedPostData.reduce(
    (acc: PostIndices, curr: PostData, index: number) => {
      acc[curr.slug] = index;
      return acc;
    },
    {}
  );
}

function readPostData(fileName: string): PostData {
  const slug = fileName.replace(".md", "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  return {
    slug,
    ...matterResult.data,
    tags: matterResult.data.tags?.split(",") ?? [],
  } as PostData;
}

function dateSort(a: PostData, b: PostData): 1 | -1 {
  if (a.date < b.date) {
    return 1;
  } else {
    return -1;
  }
}
