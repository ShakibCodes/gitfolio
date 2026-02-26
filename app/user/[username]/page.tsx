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

  const contributions = contribData?.contributions ?? [];

  // weeks transformation logic
  const weeks: any[] = [];
  let week: any[] = [];

  contributions.forEach((day: any, i: number) => {
    week.push(day);

    if ((i + 1) % 7 === 0) {
      weeks.push(week);
      week = [];
    }
  });

  if (week.length) weeks.push(week);

  // FETCHING PART ENDS

  // Sort repos by stars (descending)
  const sortedRepos = repos.sort(
    (a: any, b: any) => b.stargazers_count - a.stargazers_count
  );

  const displayRepos = sortedRepos.slice(0, 6);

  const totalStars = repos.reduce(
    (sum: number, repo: any) => sum + repo.stargazers_count,
    0
  );

  const topRepo = repos.sort(
    (a: any, b: any) => b.stargazers_count - a.stargazers_count
  )[0];

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
    <div className="min-h-screen bg-[#0b0b0c] text-white px-4 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-tight">Gitfolio</h1>
        <p className="text-gray-400 mt-2">GitHub profile, beautifully simplified</p>
      </div>

      {/* Profile Card */}
      <div className="max-w-5xl mx-auto bg-[#111113] border border-white/10 rounded-2xl p-8 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <img
            src={user.avatar_url}
            alt="avatar"
            className="w-28 h-28 rounded-full ring-4 ring-white/10"
          />

          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{user.name || user.login}</h2>
            <p className="text-gray-400">@{user.login}</p>
            {user.bio && (
              <p className="text-gray-300 mt-3 max-w-xl">{user.bio}</p>
            )}

            <div className="flex gap-8 mt-6 text-sm">
              <div>
                <p className="text-lg font-semibold">{user.followers}</p>
                <p className="text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{user.following}</p>
                <p className="text-gray-400">Following</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{user.public_repos}</p>
                <p className="text-gray-400">Repos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats + Repos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Stats Card */}
        <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-6">Overview</h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Public Repositories</span>
              <span className="font-medium">{user.public_repos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Stars</span>
              <span className="font-medium">{totalStars}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Top Language</span>
              <span className="font-medium">{mostUsedLanguage}</span>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-sm text-gray-400 mb-2">Top Repository</h4>
            {topRepo ? (
              <a
                href={topRepo.html_url}
                target="_blank"
                className="block border border-white/10 rounded-lg p-4 hover:border-white/20 hover:bg-white/5 transition"
              >
                <p className="font-medium">{topRepo.name}</p>
                <p className="text-gray-400 text-sm mt-1">
                  ⭐ {topRepo.stargazers_count}
                </p>
              </a>
            ) : (
              <p className="text-gray-500">No repositories</p>
            )}
          </div>
        </div>

        {/* Top Repositories */}
        <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-6">Top Repositories</h3>

          {displayRepos.length > 0 ? (
            <div className="space-y-3">
              {displayRepos.map((repo: any) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  className="block border border-white/10 rounded-lg p-4 hover:border-white/20 hover:bg-white/5 transition"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{repo.name}</p>
                    {repo.language && (
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                        {repo.language}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4 text-xs text-gray-400 mt-2">
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No repositories found.</p>
          )}
        </div>
      </div>

      {/* Contribution Heatmap */}
      <div className="max-w-5xl mx-auto mt-10 bg-[#111113] border border-white/10 rounded-2xl p-6 shadow-lg overflow-x-auto">
        <h3 className="text-lg font-semibold mb-6">Contribution Activity</h3>

        <div className="flex gap-1">
          {weeks.map((week: any[], i: number) => (
            <div key={i} className="flex flex-col gap-1">
              {week.map((day: any, j: number) => (
                <div
                  key={j}
                  title={`${day.date}: ${day.count} contributions`}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor:
                      day.count === 0
                        ? "#161b22"
                        : day.count < 3
                        ? "#0e4429"
                        : day.count < 6
                        ? "#006d32"
                        : day.count < 10
                        ? "#26a641"
                        : "#39d353",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}