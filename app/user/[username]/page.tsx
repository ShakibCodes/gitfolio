export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;


// FETCHING PART STARTS
  // Fetch user
  const userRes = await fetch(`https://api.github.com/users/${username}`);
  if (!userRes.ok) return <div>User not found</div>;
  const user = await userRes.json();

  // Fetch repos
  const repoRes = await fetch(`https://api.github.com/users/${username}/repos`);
  const repos = await repoRes.json();

  // Fetch contributions
const contribRes = await fetch(
  `https://github-contributions-api.jogruber.de/v4/${username}`
);
const contribData = await contribRes.json();
const weeks = contribData.contributions;
// FETCHING PART ENDS


  // Sort repos by stars (descending)
const sortedRepos = repos.sort(
  (a: any, b: any) => b.stargazers_count - a.stargazers_count
);

// Limit to top 6 repos
const displayRepos = sortedRepos.slice(0, 6);

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


  {/* Profile Card */}
  <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center mb-8">
    <img
      src={user.avatar_url}
      alt="avatar"
      className="w-24 h-24 rounded-full mx-auto mb-4 border"
    />

    <h1 className="text-2xl font-bold">
      {user.name || user.login}
    </h1>

    <p className="text-gray-500">@{user.login}</p>

    {user.bio && (
      <p className="text-gray-600 mt-3">{user.bio}</p>
    )}

    <div className="flex justify-center gap-6 mt-4 text-sm">
      <div>
        <p className="font-semibold">{user.followers}</p>
        <p className="text-gray-500">Followers</p>
      </div>
      <div>
        <p className="font-semibold">{user.following}</p>
        <p className="text-gray-500">Following</p>
      </div>
      <div>
        <p className="font-semibold">{user.public_repos}</p>
        <p className="text-gray-500">Repos</p>
      </div>
    </div>
  </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      {/* Stats Card */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Stats</h2>
        <p>Public Repos: {user.public_repos}</p>
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

      {/* Repositories */}
<div className="bg-white shadow-md rounded-lg p-6">
  <h2 className="text-xl font-semibold mb-4">Top Repositories</h2>

  {displayRepos.length > 0 ? (
    <div className="space-y-3">
      {displayRepos.map((repo: any) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          className="block border rounded-lg p-4 hover:bg-gray-50 transition"
        >
          <p className="font-medium text-lg">{repo.name}</p>

          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>⭐ {repo.stargazers_count}</span>
            <span>forks {repo.forks_count}</span>
            <span>🧠 {repo.language || "N/A"}</span>
          </div>
        </a>
      ))}
    </div>
  ) : (
    <p>No repositories found.</p>
  )}
</div>

    </div>
    </div>
  );
}