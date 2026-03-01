import { NextResponse } from "next/server";
import { getTwitchAppAccessToken } from "@/lib/twitch-auth";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const TWITCH_USERNAME = "sasavot";

export async function GET() {
  try {
    const token = await getTwitchAppAccessToken(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);

    const headers = {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    };

    // Get user info
    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${TWITCH_USERNAME}`,
      { headers }
    );
    const userData = await userRes.json();
    const user = userData.data?.[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id as string;

    // Get schedule from today's UTC midnight so current day is included
    const today = new Date();
    const startOfUtcDay = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0)
    );

    const scheduleRes = await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${userId}&start_time=${startOfUtcDay.toISOString()}&first=100`,
      { headers }
    );
    const scheduleData = await scheduleRes.json();

    const scheduleSegments: any[] = scheduleData.data?.segments || [];
    const vacation = scheduleData.data?.vacation || null;

    // Get category information for each segment
    const categoryIds = [
      ...new Set(
        scheduleSegments
          .filter((segment: any) => segment.category)
          .map((segment: any) => segment.category)
      ),
    ];

    const categories: Record<string, string> = {};

    if (categoryIds.length > 0) {
      const categoriesRes = await fetch(
        `https://api.twitch.tv/helix/games?id=${categoryIds.join("&id=")}`,
        { headers }
      );
      const categoriesData = await categoriesRes.json();

      categoriesData.data?.forEach((game: any) => {
        categories[game.id] = game.name;
      });
    }

    return NextResponse.json(
      {
        segments: scheduleSegments.map((segment: any) => ({
          id: segment.id,
          title: segment.title,
          category: categories[segment.category] || "Стрим",
          category_id: segment.category,
          start_time: segment.start_time,
          end_time: segment.end_time,
          is_recurring: segment.is_recurring,
          timezone: segment.timezone,
          canceled_until: segment.canceled_until,
        })),
        vacation,
        user: {
          id: user.id,
          login: user.login,
          display_name: user.display_name,
        },
      },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("Twitch Schedule API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Twitch schedule" },
      { status: 500 }
    );
  }
}
