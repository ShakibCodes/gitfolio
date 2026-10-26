import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const groqKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!groqKey) {
      return NextResponse.json(
        {
          error: 'NO_KEY',
          message: 'No Groq API key configured on server. Switching to GitFolio Local Intelligence Engine.',
        },
        { status: 200 }
      );
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          error: 'GROQ_ERROR',
          message: errText,
          fallback: true,
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'SERVER_ERROR',
        message: String(error),
        fallback: true,
      },
      { status: 200 }
    );
  }
}
