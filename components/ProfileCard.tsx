export default function ProfileCard({ user }: { user: any }) {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md text-center mb-8">
      <img
        src={user.avatar_url}
        alt="avatar"
        className="w-24 h-24 rounded-full mx-auto mb-4 border"
      />

      <h1 className="text-2xl font-bold">{user.name || user.login}</h1>
      <p className="text-gray-500">@{user.login}</p>

      {user.bio && <p className="text-gray-600 mt-3">{user.bio}</p>}

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
  );
}