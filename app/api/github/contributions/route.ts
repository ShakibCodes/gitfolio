import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    const token = process.env.GITHUB_TOKEN;

    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  color
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const data = await response.json();
    return NextResponse.json(data.data.user.contributionsCollection.contributionCalendar);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}