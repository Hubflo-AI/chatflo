import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { signIn } from "@/app/(auth)/auth";
import { isDevelopmentEnvironment } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirectUrl") || "/";

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Credentials provider doesn't support redirect: true from GET handlers
  // (causes InvalidProvider: "Callback for provider type (credentials) is not supported")
  try {
    const result = await signIn("guest", {
      redirect: false,
      redirectTo: redirectUrl,
    });

    // signIn returns the redirect URL string on success
    const targetUrl =
      typeof result === "string" ? result : redirectUrl;
    return NextResponse.redirect(new URL(targetUrl, request.url));
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
