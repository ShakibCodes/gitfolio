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
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      
      {/* Profile */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">
          {user.name} <span className="text-gray-500">(@{user.login})</span>
        </h1>
        <p className="text-gray-600 mt-2 max-w-xl">{user.bio}</p>
      </div>

      {/* Stats Card */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Stats</h2>
        <p>📦 Public Repos: {user.public_repos}</p>
        <p>⭐ Total Stars: {totalStars}</p>
        <p>🧠 Most Used Language: {mostUsedLanguage}</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Top Repo</h2>
        {topRepo ? (
          <div className="border rounded p-3">
            <p className="font-medium">{topRepo.name}</p>
            <p className="text-sm text-gray-600">
              ⭐ {topRepo.stargazers_count}
            </p>
          </div>
        ) : (
          <p>No repositories</p>
        )}
      </div>
    </div>
  );
}