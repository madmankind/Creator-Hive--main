import { NextResponse } from "next/server";
export async function GET() {
  const data = [
    { date: "2025-08-01", revenue: 4200, bookings: 6 },
    { date: "2025-08-08", revenue: 9100, bookings: 11 },
    { date: "2025-08-15", revenue: 7600, bookings: 9 },
  ];
  return NextResponse.json(data);
}

