import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/v1/stats`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: (error as Error).message },
      { status: 500 },
    );
  }
}
