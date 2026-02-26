export default function RepoList({ repos }: { repos: any[] }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4">Top Repositories</h2>

      <div className="space-y-3">
        {repos.map((repo) => (
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
    </div>
  );
}