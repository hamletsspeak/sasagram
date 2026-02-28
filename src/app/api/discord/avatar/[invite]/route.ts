import { NextResponse } from "next/server";

const DISCORD_API_BASE = "https://discord.com/api/v9";

function fallbackAvatar(invite: string): string {
  return `https://api.dicebear.com/9.x/thumbs/png?seed=discord-${encodeURIComponent(invite)}&backgroundColor=0f172a,111827,030712`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ invite: string }> }
) {
  const { invite } = await context.params;
  if (!invite) {
    return NextResponse.redirect(fallbackAvatar("invite"), {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    });
  }

  try {
    const response = await fetch(
      `${DISCORD_API_BASE}/invites/${encodeURIComponent(invite)}?with_counts=true&with_expiration=true`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch Discord invite");

    const data = (await response.json()) as {
      guild?: {
        id?: string;
        icon?: string;
      };
    };

    const guildId = data.guild?.id;
    const iconHash = data.guild?.icon;

    if (guildId && iconHash) {
      const ext = iconHash.startsWith("a_") ? "gif" : "png";
      const iconUrl = `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=256`;

      return NextResponse.redirect(iconUrl, {
        status: 307,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }
  } catch {
    // fall through to fallback
  }

  return NextResponse.redirect(fallbackAvatar(invite), {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
