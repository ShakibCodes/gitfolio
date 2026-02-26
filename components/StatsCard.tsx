export default function StatsCard({
  totalStars,
  mostUsedLanguage,
  topRepo,
  repoCount,
}: any) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4">Stats</h2>
      <p>Public Repos: {repoCount}</p>
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
  );
}