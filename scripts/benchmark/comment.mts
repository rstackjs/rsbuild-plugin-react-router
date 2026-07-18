import path from 'node:path';
import { fileURLToPath } from 'node:url';

const marker = '<!-- react-router-benchmark-ci -->';

type GitHubIssueComment = {
  id: number;
  body: string | null;
};

const requiredEnvironment = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
};

const repositoryUrl = (repository: string) => {
  const [owner, name, ...rest] = repository.split('/');
  if (!owner || !name || rest.length > 0) {
    throw new Error('GITHUB_REPOSITORY must be in the form owner/repository.');
  }
  return `https://api.github.com/repos/${owner}/${name}`;
};

export const findBenchmarkComment = (
  comments: readonly GitHubIssueComment[]
) => {
  for (let index = comments.length - 1; index >= 0; index -= 1) {
    if (comments[index].body?.includes(marker)) {
      return comments[index];
    }
  }
  return null;
};

const requestHeaders = (token: string) => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
});

const listIssueComments = async (url: string, token: string) => {
  const comments: GitHubIssueComment[] = [];

  for (let page = 1; ; page += 1) {
    const response = await fetch(`${url}?per_page=100&page=${page}`, {
      headers: requestHeaders(token),
    });
    if (!response.ok) {
      throw new Error(
        `Unable to list pull-request comments: ${response.status} ${response.statusText}`
      );
    }

    const pageComments: unknown = await response.json();
    if (!Array.isArray(pageComments)) {
      throw new Error(
        'Unable to list pull-request comments: invalid response.'
      );
    }
    comments.push(...(pageComments as GitHubIssueComment[]));

    if (pageComments.length < 100) {
      return comments;
    }
  }
};

export const run = async () => {
  const token = requiredEnvironment('GH_TOKEN');
  const repository = requiredEnvironment('GITHUB_REPOSITORY');
  const prNumber = requiredEnvironment('PR_NUMBER');
  const body = requiredEnvironment('COMMENT_BODY');
  const url = repositoryUrl(repository);
  const commentsUrl = `${url}/issues/${prNumber}/comments`;
  const current = findBenchmarkComment(
    await listIssueComments(commentsUrl, token)
  );
  const response = await fetch(
    current ? `${url}/issues/comments/${current.id}` : commentsUrl,
    {
      method: current ? 'PATCH' : 'POST',
      headers: requestHeaders(token),
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to ${current ? 'update' : 'create'} pull-request comment: ${response.status} ${response.statusText}`
    );
  }
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  void run().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
