export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Fetch user
  const userRes = await fetch(`https://api.github.com/users/${username}`);
  if (!userRes.ok) return <div>User not found</div>;
  const user = await userRes.json();

  // Fetch repos
  const repoRes = await fetch(`https://api.github.com/users/${username}/repos`);
  const repos = await repoRes.json();

  // Total stars
  const totalStars = repos.reduce(
    (sum: number, repo: any) => sum + repo.stargazers_count,
    0
  );

  // Top repo
  const topRepo = repos.sort(
    (a: any, b: any) => b.stargazers_count - a.stargazers_count
  )[0];

  // Most used language
  const languageCount: Record<string, number> = {};

  repos.forEach((repo: any) => {
    if (repo.language) {
      languageCount[repo.language] =
        (languageCount[repo.language] || 0) + 1;
    }
  });

  const mostUsedLanguage =
    Object.entries(languageCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "N/A";

  return (
    <div className="text-center mt-23">
      <h1 className="text-3xl font-bold">{user.name} (@{user.login})</h1>
      
      <p>{user.bio}</p>
    <div className="mt-20 ml-130 bg-gray-400 max-w-120">
      <h2 className="font-bold">Stats</h2>
      <p>Public Repos: {user.public_repos}</p>
      <p>Total Stars: {totalStars}</p>
      <p>Most Used Language: {mostUsedLanguage}</p>

      <h2>Top Repo</h2>
      {topRepo ? (
        <div>
          <p>{topRepo.name}</p>
          <p>⭐ {topRepo.stargazers_count}</p>
        </div>
      ) : (
        <p>No repositories</p>
      )}
    </div>
    </div>
  );
}