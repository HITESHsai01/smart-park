import { NextResponse } from "next/server";
import { getCoordinates } from "@/app/lib/geocode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return new NextResponse("Missing query", { status: 400 });
  }

  try {
    const coords = await getCoordinates(q);
    if (coords) {
      return NextResponse.json(coords);
    } else {
      return new NextResponse("Not found", { status: 404 });
    }
  } catch (error) {
    console.error("Geocoding API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
