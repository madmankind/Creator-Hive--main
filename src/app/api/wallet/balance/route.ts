import { NextResponse } from 'next/server';

// Mock wallet balance data
const mockBalance = {
  available: 2450.00,
  pending: 1250.00,
  nextPayout: {
    amount: 2450.00,
    date: '2024-01-15',
    status: 'scheduled'
  },
  currency: 'USD',
  lastUpdated: new Date().toISOString()
};

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return NextResponse.json(mockBalance);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch wallet balance' },
      { status: 500 }
    );
  }
}