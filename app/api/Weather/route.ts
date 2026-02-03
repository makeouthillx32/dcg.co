import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location");

  if (!location) {
    return NextResponse.json(
      { error: "Location query parameter is required." },
      { status: 400 }
    );
  }

  try {
    const API_KEY = process.env.WEATHER_API_KEY; // Ensure this is set in your Vercel environment variables

    if (!API_KEY) {
      console.error("Missing API Key: WEATHER_API_KEY is undefined");
      return NextResponse.json(
        { error: "API Key is missing or undefined." },
        { status: 500 }
      );
    }

    // Build the Weather API URL
    const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(
      location
    )}`;

    console.log("Weather API URL:", weatherApiUrl); // Log the URL for debugging

    const response = await fetch(weatherApiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Error fetching weather data:",
        errorData.error?.message || "Unknown error"
      );
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to fetch weather data." },
        { status: response.status }
      );
    }

    const weatherData = await response.json();
    return NextResponse.json(weatherData);
  } catch (error: any) {
    console.error("Internal Server Error:", error.message || error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
