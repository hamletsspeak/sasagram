import { NextResponse } from "next/server";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const TWITCH_USERNAME = "sasavot";

async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to get Twitch access token");
  const data = await res.json();
  return data.access_token as string;
}

export async function GET() {
  try {
    const token = await getAccessToken();

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

    // Get channel schedule for the current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const scheduleRes = await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${userId}&start_time=${startOfMonth.toISOString()}&first=100`,
      { headers }
    );
    const scheduleData = await scheduleRes.json();
    
    // the Twitch API returns an array of schedule segments; we'll treat
    // them as `any` for now since we don't have a strict type definition
    // and the response shape can vary.  TypeScript was complaining about
    // the parameter `segment` implicitly having an `any` type when we
    // filtered below, so we give the array an explicit `any[]` annotation.
    const scheduleSegments: any[] = scheduleData.data?.segments || [];
    const vacation = scheduleData.data?.vacation || null;

    // Get category information for each segment
    const categoryIds = [...new Set(
      scheduleSegments
        .filter((segment: any) => segment.category)
        .map((segment: any) => segment.category)
    )];

    let categories: Record<string, string> = {};
    
    if (categoryIds.length > 0) {
      const categoriesRes = await fetch(
        `https://api.twitch.tv/helix/games?id=${categoryIds.join('&id=')}`,
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
