import { fetchKickJson, findLiveFlag } from "@/server/kick/service";
import { getTwitchAppAccessToken } from "@/server/twitch/auth";

const TWITCH_LOGINS = ["rostikfacekid", "poisonika", "tankzor", "formixyouknow", "narekcr", "r4dom1r", "yurapivo"];
const KICK_SLUGS = ["helin139ban"];

type CreatorState = {
  isLive: boolean;
  avatarUrl?: string;
  displayName?: string;
  platform: "Twitch" | "Kick";
};

async function getTwitchAccessToken(): Promise<string | null> {
  try {
    return await getTwitchAppAccessToken(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
  } catch {
    return null;
  }
}

export async function getWatchAlsoPayload() {
  const creators: Record<string, CreatorState> = {};

  try {
    const token = await getTwitchAccessToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (token && clientId) {
      const headers = {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
      };

      const usersParams = new URLSearchParams();
      for (const login of TWITCH_LOGINS) usersParams.append("login", login);

      const streamsParams = new URLSearchParams();
      for (const login of TWITCH_LOGINS) streamsParams.append("user_login", login);

      const [usersRes, streamsRes] = await Promise.all([
        fetch(`https://api.twitch.tv/helix/users?${usersParams.toString()}`, {
          headers,
          next: { revalidate: 60 },
        }),
        fetch(`https://api.twitch.tv/helix/streams?${streamsParams.toString()}`, {
          headers,
          next: { revalidate: 60 },
        }),
      ]);

      const usersJson = usersRes.ok
        ? ((await usersRes.json()) as { data?: Array<{ login?: string; display_name?: string }> })
        : { data: [] };

      const streamsJson = streamsRes.ok
        ? ((await streamsRes.json()) as { data?: Array<{ user_login?: string }> })
        : { data: [] };

      const liveLogins = new Set((streamsJson.data ?? []).map((item) => (item.user_login ?? "").toLowerCase()).filter(Boolean));

      for (const login of TWITCH_LOGINS) {
        const user = (usersJson.data ?? []).find((item) => (item.login ?? "").toLowerCase() === login.toLowerCase());

        creators[login.toLowerCase()] = {
          platform: "Twitch",
          isLive: liveLogins.has(login.toLowerCase()),
          avatarUrl: `/api/twitch/avatar/${encodeURIComponent(login.toLowerCase())}`,
          displayName: user?.display_name ?? login,
        };
      }
    }
  } catch {
    // Keep fallback values from client-side config.
  }

  try {
    for (const slug of KICK_SLUGS) {
      const channelPayload = await fetchKickJson(`https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(slug)}`);
      const live = findLiveFlag(channelPayload);

      creators[slug.toLowerCase()] = {
        platform: "Kick",
        isLive: live ?? false,
        avatarUrl: `/api/kick/avatar/${encodeURIComponent(slug.toLowerCase())}`,
        displayName: slug,
      };
    }
  } catch {
    // Keep fallback values from client-side config.
  }

  return {
    creators,
    fetchedAt: new Date().toISOString(),
  };
}
