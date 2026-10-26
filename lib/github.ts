import { GitHubUser, Repo, ContributionData, DevMetrics } from '@/types/github';

export const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Dart: '#00B4AB',
  PHP: '#4F5D95',
  Solidity: '#AA6746',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Lua: '#000080',
  Jupyter: '#DA5B0B',
  Zig: '#ec915c',
  OCaml: '#3be133',
};

export function getLangColor(lang: string | null | undefined): string {
  if (!lang) return '#8b949e';
  return LANG_COLORS[lang] || '#8b949e';
}

export function calculateMetrics(
  user: GitHubUser,
  repos: Repo[],
  contributions?: ContributionData | null
): DevMetrics {
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const originalRepos = repos.filter((r) => !r.fork);

  // Language Breakdown
  const langCountMap: Record<string, { count: number; stars: number }> = {};
  repos.forEach((r) => {
    if (r.language) {
      if (!langCountMap[r.language]) {
        langCountMap[r.language] = { count: 0, stars: 0 };
      }
      langCountMap[r.language].count += 1;
      langCountMap[r.language].stars += r.stargazers_count || 0;
    }
  });

  const totalRepoLangs = Object.values(langCountMap).reduce((a, b) => a + b.count, 0) || 1;
  const languages = Object.entries(langCountMap)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, data]) => ({
      name,
      count: data.count,
      stars: data.stars,
      percentage: Math.round((data.count / totalRepoLangs) * 100),
      color: getLangColor(name),
    }));

  const primaryLanguage = languages[0]?.name || 'Polyglot';

  // Streak & Activity Calculation
  let longestStreak = 0;
  let currentStreak = 0;
  let runningStreak = 0;
  let bestDay = { date: '', count: 0 };

  if (contributions?.weeks && contributions.weeks.length > 0) {
    const allDays = contributions.weeks.flatMap((w) => w.contributionDays);
    allDays.forEach((day) => {
      if (day.contributionCount > bestDay.count) {
        bestDay = { date: day.date, count: day.contributionCount };
      }
      if (day.contributionCount > 0) {
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else {
        runningStreak = 0;
      }
    });

    // Current streak (counting backwards from last day)
    let tempCurrent = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].contributionCount > 0) {
        tempCurrent++;
      } else {
        // If today has 0, check yesterday before breaking
        if (i === allDays.length - 1) continue;
        break;
      }
    }
    currentStreak = tempCurrent;
  }

  // 5 Pillars Score (0 - 100 each)
  // 1. Star Power (Logarithmic curve)
  const starPower = Math.min(100, Math.round(Math.log10(totalStars + 1) * 26));

  // 2. Activity (Based on repos + contributions)
  const totalContribs = contributions?.totalContributions || repos.length * 12;
  const activity = Math.min(100, Math.round(Math.min(50, repos.length * 1.5) + Math.min(50, totalContribs / 25)));

  // 3. Polyglot Breadth
  const langCount = languages.length;
  const polyglot = Math.min(100, langCount * 18);

  // 4. Consistency
  const consistency = Math.min(100, Math.round(longestStreak * 3.5 + currentStreak * 2));

  // 5. Community (Followers & Forks)
  const community = Math.min(100, Math.round(Math.log10(user.followers + totalForks + 1) * 28));

  // Overall Score (Weighted aggregate)
  const rawScore = Math.round(
    starPower * 0.28 +
    activity * 0.22 +
    polyglot * 0.15 +
    consistency * 0.15 +
    community * 0.20
  );
  const score = Math.max(15, Math.min(99, rawScore));

  // Tier determination
  let tier: 'S+' | 'S' | 'A' | 'B' | 'C' = 'C';
  if (score >= 90) tier = 'S+';
  else if (score >= 78) tier = 'S';
  else if (score >= 60) tier = 'A';
  else if (score >= 40) tier = 'B';
  else tier = 'C';

  // Archetype
  let archetype = 'Software Craftsman';
  let archetypeDesc = 'Builds functional software with consistent steady iteration.';

  if (totalStars > 500 || user.followers > 800) {
    archetype = 'Open Source Titan';
    archetypeDesc = 'High community influence with widely starred tools and library ecosystems.';
  } else if (languages.length >= 5) {
    archetype = 'Polyglot Architect';
    archetypeDesc = 'Effortlessly bridges multiple paradigms and language ecosystems across systems.';
  } else if (longestStreak > 40 || (contributions && contributions.totalContributions > 800)) {
    archetype = 'Relentless Builder';
    archetypeDesc = 'Exceptional shipping cadence and relentless continuous engineering discipline.';
  } else if (primaryLanguage === 'Rust' || primaryLanguage === 'Go' || primaryLanguage === 'C++') {
    archetype = 'High-Performance Systems Specialist';
    archetypeDesc = 'Specializes in low-latency infrastructure, compiled binaries, and reliability.';
  } else if (primaryLanguage === 'TypeScript' || primaryLanguage === 'JavaScript') {
    archetype = 'Fullstack Product Engineer';
    archetypeDesc = 'Modern web visionary crafting responsive user experiences and cloud backends.';
  } else if (primaryLanguage === 'Python') {
    archetype = 'Data & AI Engineer';
    archetypeDesc = 'Transforms algorithms, machine learning workflows, and automation into solutions.';
  }

  // Badges
  const badges = [];
  if (totalStars >= 50) {
    badges.push({ id: 'starmagnet', label: 'Star Magnet', icon: '⭐', desc: `${totalStars.toLocaleString()} total repository stars acquired` });
  }
  if (longestStreak >= 20) {
    badges.push({ id: 'streakmaster', label: 'Iron Consistency', icon: '🔥', desc: `${longestStreak}-day unbroken contribution streak` });
  }
  if (languages.length >= 4) {
    badges.push({ id: 'polyglot', label: 'Multi-Lingual', icon: '🌐', desc: `Proficient across ${languages.length} distinct programming languages` });
  }
  if (user.followers >= 50) {
    badges.push({ id: 'community', label: 'Community Beacon', icon: '👥', desc: `${user.followers.toLocaleString()} developers follow their work` });
  }
  if (originalRepos.length >= 10) {
    badges.push({ id: 'creator', label: 'Prolific Creator', icon: '🚀', desc: `Authored ${originalRepos.length} original open source projects` });
  }
  if (new Date(user.created_at).getFullYear() <= 2018) {
    badges.push({ id: 'veteran', label: 'GitHub Veteran', icon: '🛡️', desc: `Active on GitHub since ${new Date(user.created_at).getFullYear()}` });
  }

  // If no badges earned yet, give early explorer
  if (badges.length === 0) {
    badges.push({ id: 'explorer', label: 'Code Explorer', icon: '🧭', desc: 'Actively exploring and contributing to modern software' });
  }

  return {
    score,
    tier,
    archetype,
    archetypeDesc,
    pillars: {
      starPower,
      activity,
      polyglot,
      consistency,
      community,
    },
    totalStars,
    totalForks,
    totalOriginalRepos: originalRepos.length,
    languages,
    primaryLanguage,
    longestStreak,
    currentStreak,
    bestDay,
    badges,
  };
}

export function generateSmartAiResponse(prompt: string, user: GitHubUser, repos: Repo[], metrics: DevMetrics): string {
  const p = prompt.toLowerCase();

  const top3Repos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3);
  const repoNames = top3Repos.map(r => `**${r.name}** (${r.stargazers_count}★)`).join(', ');
  const topLangs = metrics.languages.slice(0, 3).map(l => `${l.name} (${l.percentage}%)`).join(', ');

  if (p.includes('roast')) {
    return `### 🔥 Savage Code Roast of @${user.login}

1. **Repository Inventory**: You have **${user.public_repos} repositories**, but let's be honest — how many of those are tutorials from 2021 titled *\`test-app-final-v2-ACTUAL\`* that haven't seen a commit since the pandemic?
2. **Language Diet**: You're living on **${topLangs || 'unnamed code'}**. Your code probably compiles on hope, prayers, and \`// @ts-ignore\` or \`try { ... } catch (e) {}\`.
3. **Star Power**: ${metrics.totalStars} total stars! That's impressive enough to put on LinkedIn with three rocket emojis 🚀🚀🚀, but we both know two of those stars are from your alternate accounts and one is from your mum.
4. **Streak Reality**: Longest streak is **${metrics.longestStreak} days**. We see you pushing empty markdown updates at 11:58 PM just to keep the green square alive!

*Verdict: You're a certified code addict, but we respect the hustle. Keep shipping!*`;
  }

  if (p.includes('resume') || p.includes('cv')) {
    return `### 📄 Generated Developer Resume: ${user.name || user.login}
**Role:** ${metrics.archetype} | **GitHub:** [@${user.login}](https://github.com/${user.login})
${user.location ? `**Location:** ${user.location} | ` : ''}${user.blog ? `**Portfolio:** ${user.blog}` : ''}

---

#### 🌟 Executive Summary
Highly capable **${metrics.archetype}** with a proven track record of shipping open-source software and tools. Demonstrates mastery across **${topLangs}**, accumulating **${metrics.totalStars.toLocaleString()} GitHub stars** across **${user.public_repos} repositories**. Evaluated in the **${metrics.tier}-Tier (${metrics.score}/100)** for technical agility and community impact.

#### 🛠️ Core Competencies & Tech Stack
- **Primary Languages:** ${metrics.languages.map(l => l.name).join(', ') || 'Polyglot'}
- **Focus Areas:** ${metrics.archetypeDesc}
- **Engineering Discipline:** ${metrics.longestStreak}-day unbroken contribution record; ${metrics.totalOriginalRepos} original public codebases.

#### 🏆 Key Projects & Achievements
${top3Repos.map(r => `- **[${r.name}](${r.html_url})** (${r.language || 'Code'}) — ${r.stargazers_count}★ | ${r.forks_count} forks\n  *${r.description || 'Core production open-source system developed and maintained for the community.'}*`).join('\n')}

#### 👥 Community & Presence
- **Followers:** ${user.followers.toLocaleString()} engineers
- **GitHub Member Since:** ${new Date(user.created_at).getFullYear()}
${user.twitter_username ? `- **X/Twitter:** @${user.twitter_username}` : ''}`;
  }

  if (p.includes('salary') || p.includes('earns') || p.includes('worth')) {
    let base = 95000;
    if (metrics.tier === 'S+') base = 195000;
    else if (metrics.tier === 'S') base = 155000;
    else if (metrics.tier === 'A') base = 125000;
    else if (metrics.tier === 'B') base = 95000;
    else base = 75000;

    const lower = Math.round((base * 0.9) / 1000) * 1000;
    const upper = Math.round((base * 1.35) / 1000) * 1000;

    return `### 💰 Market Compensation Estimate: @${user.login}

Based on developer profile analytics, code velocity, star influence, and technology rarity:

- **Estimated Base Salary Range (US / Remote Equivalent):**
  ### **\$${lower.toLocaleString()} — \$${upper.toLocaleString()} USD / yr**
- **Target Seniority:** ${metrics.score > 85 ? 'Staff / Principal Engineer / Tech Lead' : metrics.score > 65 ? 'Senior Software Engineer' : 'Mid-Level Software Engineer'}
- **Key Value Multipliers:**
  - **Dominant Stack:** ${topLangs} — High industry demand.
  - **Open Source Validation:** ${metrics.totalStars} total stars shows ability to author code that peers use and validate.
  - **Consistency Index:** ${metrics.pillars.consistency}/100. Reliable contributor who doesn't abandon codebases.`;
  }

  if (p.includes('hire') || p.includes('recommendation')) {
    return `### 🤝 Hiring Intelligence Dossier: @${user.login}

#### 🎯 Executive Verdict
**Recommendation:** **Strong Hire for ${metrics.archetype} Roles** (${metrics.score}/100 GitFolio Rating)

#### ✅ Top Strengths
1. **Proven Output**: Has authored ${metrics.totalOriginalRepos} original repositories and maintained active open source work.
2. **Flagship Work**: Demonstrated project leadership with ${repoNames || 'well-structured repositories'}.
3. **Execution Reliability**: Logged a peak streak of **${metrics.longestStreak} consecutive days** of active code development.

#### ⚠️ Considerations
- Check recent activity cadence to verify current bandwidth and open source vs private commitments.
- Interview on system design and architectural trade-offs using their top repository **${top3Repos[0]?.name || 'work'}** as a case study.

#### 💡 Recommended Technical Interview Questions:
1. *"In your project \`${top3Repos[0]?.name || 'main repo'}\`, what was the most difficult latency or architectural bottleneck you encountered?"*
2. *"How do you balance tech debt when refactoring in ${metrics.primaryLanguage}?"*`;
  }

  if (p.includes('social') || p.includes('presence')) {
    const socials = [];
    socials.push(`- **GitHub:** [github.com/${user.login}](https://github.com/${user.login})`);
    if (user.twitter_username) {
      socials.push(`- **X / Twitter:** [@${user.twitter_username}](https://twitter.com/${user.twitter_username})`);
    }
    if (user.blog) {
      const blogUrl = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
      socials.push(`- **Personal Website / Blog:** [${user.blog}](${blogUrl})`);
    }
    if (user.company) {
      socials.push(`- **Company / Organization:** ${user.company}`);
    }
    if (user.location) {
      socials.push(`- **Location:** ${user.location}`);
    }

    return `### 🌐 Discovered Social Footprint for @${user.login}

${socials.join('\n')}

**Profile Summary:**
${user.bio || 'No public bio provided on GitHub.'}
Member of GitHub developer ecosystem since **${new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}**.`;
  }

  // Default deep analysis
  return `### 🧠 Developer Intelligence Brief: @${user.login}

- **Developer Archetype:** **${metrics.archetype}** (${metrics.tier}-Tier, Score: **${metrics.score}/100**)
- **Core Technology Stack:** ${topLangs}
- **Total Stars:** ${metrics.totalStars.toLocaleString()}★ across ${user.public_repos} repositories
- **Key Repositories:** ${repoNames || 'Public work available on profile'}
- **Contribution Rhythm:** Longest streak of ${metrics.longestStreak} days with active community footprint.

Ask anything specific:
- *"Give me a savage roast of their code"*
- *"Write their 1-page executive resume"*
- *"Estimate their market salary"*
- *"Would you hire them for a team lead role?"*`;
}
