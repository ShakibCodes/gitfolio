export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  company: string;
  location: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  hireable: boolean | null;
  html_url: string;
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  html_url: string;
  homepage: string;
  topics: string[];
  updated_at: string;
  created_at: string;
  pushed_at: string;
  open_issues_count: number;
  fork: boolean;
  archived: boolean;
  size: number;
  license?: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
  default_branch: string;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  color?: string;
}

export interface Week {
  contributionDays: ContributionDay[];
}

export interface ContributionData {
  totalContributions: number;
  weeks: Week[];
}

export interface DevMetrics {
  score: number;
  tier: 'S+' | 'S' | 'A' | 'B' | 'C';
  archetype: string;
  archetypeDesc: string;
  pillars: {
    starPower: number;
    activity: number;
    polyglot: number;
    consistency: number;
    community: number;
  };
  totalStars: number;
  totalForks: number;
  totalOriginalRepos: number;
  languages: { name: string; count: number; stars: number; percentage: number; color: string }[];
  primaryLanguage: string;
  longestStreak: number;
  currentStreak: number;
  bestDay: { date: string; count: number };
  badges: { id: string; label: string; icon: string; desc: string }[];
}
