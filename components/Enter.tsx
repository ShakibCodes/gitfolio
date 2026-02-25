"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Enter = () => {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    router.push(`/user/${username}`);
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <label className="text-2xl font-bold">GitHub Username: </label>
        <input
          className="border p-1"
          type="text"
          placeholder="Enter github username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <button
          type="submit"
          className="border-2 border-black ml-0.5 p-0.5 cursor-pointer bg-gray-400 text-white hover:bg-gray-700"
        >
          Enter
        </button>
      </form>
    </main>
  );
};

export default Enter;