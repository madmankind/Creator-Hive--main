import { NextResponse } from 'next/server';

// Mock metrics data
const mockMetrics = [
  { date: '2024-01-01', revenue: 1200, bookings: 3 },
  { date: '2024-01-02', revenue: 850, bookings: 2 },
  { date: '2024-01-03', revenue: 2100, bookings: 4 },
  { date: '2024-01-04', revenue: 950, bookings: 2 },
  { date: '2024-01-05', revenue: 1650, bookings: 3 },
  { date: '2024-01-06', revenue: 2300, bookings: 5 },
  { date: '2024-01-07', revenue: 1800, bookings: 4 },
  { date: '2024-01-08', revenue: 1400, bookings: 3 },
  { date: '2024-01-09', revenue: 2000, bookings: 4 },
  { date: '2024-01-10', revenue: 1100, bookings: 2 },
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(mockMetrics);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}