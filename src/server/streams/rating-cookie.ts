import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const RATING_COOKIE_NAME = "sasagram_viewer";
const RATING_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2;

function createAnonymousViewerToken(): string {
  return randomBytes(32).toString("base64url");
}

function isValidViewerToken(token: string | undefined): token is string {
  return typeof token === "string" && token.length >= 32;
}

export function hashViewerToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getAnonymousViewer(request: NextRequest) {
  const existingToken = request.cookies.get(RATING_COOKIE_NAME)?.value;

  if (isValidViewerToken(existingToken)) {
    return {
      tokenHash: hashViewerToken(existingToken),
      applyCookie: (_response: NextResponse) => {},
    };
  }

  const token = createAnonymousViewerToken();

  return {
    tokenHash: hashViewerToken(token),
    applyCookie: (response: NextResponse) => {
      response.cookies.set({
        name: RATING_COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: RATING_COOKIE_MAX_AGE_SECONDS,
      });
    },
  };
}
