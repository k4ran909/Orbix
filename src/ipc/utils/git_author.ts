import { getGithubUser } from "../handlers/github_handlers";

export async function getGitAuthor() {
  const user = await getGithubUser();
  const author = user
    ? {
        name: `[Orbix]`,
        email: user.email,
      }
    : {
        name: "[Orbix]",
        email: "git@orbix.sh",
      };
  return author;
}
