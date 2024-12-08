import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse(
    JSON.stringify({
      data: {},
      error_code: '',
      message: '',
      status: 'ok',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
