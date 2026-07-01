#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const marker = '<!-- react-router-benchmark-ci -->';
const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
const repository = process.env.REPOSITORY ?? process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const commentPath = process.env.COMMENT_BODY;

if (!token || !repository || !prNumber || !commentPath) {
  throw new Error(
    'GH_TOKEN, REPOSITORY, PR_NUMBER, and COMMENT_BODY are required.'
  );
}

const getRequestUrl = path =>
  path.startsWith('https://')
    ? path
    : `https://api.github.com/repos/${repository}${path}`;

const getNextPageUrl = linkHeader => {
  if (!linkHeader) {
    return null;
  }

  for (const link of linkHeader.split(',')) {
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    if (match) {
      return match[1];
    }
  }

  return null;
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(getRequestUrl(path), {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(
      `GitHub API ${options.method ?? 'GET'} ${path} failed with ${response.status}: ${await response.text()}`
    );
  }
  return {
    data: response.status === 204 ? null : await response.json(),
    nextPage: getNextPageUrl(response.headers.get('link')),
  };
};

const request = async (path, options = {}) =>
  (await requestJson(path, options)).data;

const requestPages = async path => {
  let nextPath = path;
  const results = [];

  while (nextPath) {
    const { data, nextPage } = await requestJson(nextPath);
    if (!Array.isArray(data)) {
      throw new Error(`Expected ${nextPath} to return an array.`);
    }
    results.push(...data);
    nextPath = nextPage;
  }

  return results;
};

const body = await readFile(commentPath, 'utf8');
const comments = await requestPages(
  `/issues/${prNumber}/comments?per_page=100`
);
const existingComment = comments
  .filter(comment => comment.body?.includes(marker))
  .at(-1);

if (existingComment) {
  await request(`/issues/comments/${existingComment.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ body }),
  });
} else {
  await request(`/issues/${prNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}
