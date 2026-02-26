export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const res = await fetch(`https://api.github.com/users/${username}`);

  if (!res.ok) {
    return <div>User not found</div>;
  }

  const user = await res.json();

  return (
    <div>
      <h1>{user.name}</h1>
      <p>@{user.login}</p>
      <p>{user.bio}</p>
      <p>Public Repos: {user.public_repos}</p>
      <p>Followers: {user.followers}</p>
      <p>Following: {user.following}</p>
    </div>
  );
}