import { NextResponse } from 'next/server';

// This route has been disabled as it relied on local-only resources that are incompatible with production deployment.
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'This debug endpoint is disabled in production.' },
    { status: 404 }
  );
}
