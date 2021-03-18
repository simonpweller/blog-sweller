import fs from "fs";
import path from "path";
import remark from "remark";
import externalLinks from "remark-external-links";
import matter from "gray-matter";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

export type PostSlugs = { params: { slug: string } }[];
export type PostData = {
  slug: string;
  date: string;
  title: string;
};
type PostIndices = { [slug: string]: number };

export const sortedPostData: PostData[] = getSortedPostData();
const postIndices: PostIndices = getPostIndices();

export const getAllPostSlugs = (): PostSlugs => {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName: string) => ({
    params: {
      slug: fileName.replace(".md", ""),
    },
  }));
};

export const getPostDetails = async (slug: string) => {
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
  } as PostData;
}

function dateSort(a: PostData, b: PostData): 1 | -1 {
  if (a.date < b.date) {
    return 1;
  } else {
    return -1;
  }
}
