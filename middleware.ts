import NextAuth from "next-auth";
import { auth } from "./auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const userRole = req.auth?.user?.role;

  // Protect /owner routes - only OWNER role can access
  if (nextUrl.pathname.startsWith("/owner")) {
    // Allow public access to sign-in and sign-up pages
    if (nextUrl.pathname.startsWith("/owner/sign-in") || nextUrl.pathname.startsWith("/owner/sign-up")) {
      return; 
    }

    if (!isLoggedIn) {
      return Response.redirect(new URL("/owner/sign-in", nextUrl));
    }
    
    // Check if user has OWNER role
    if (userRole !== "OWNER") {
      // Redirect to home with error message
      const redirectUrl = new URL("/", nextUrl);
      redirectUrl.searchParams.set("error", "unauthorized");
      return Response.redirect(redirectUrl);
    }
  }

  // Protect /booking routes - must be logged in
  if (nextUrl.pathname.startsWith("/booking")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/sign-in", nextUrl));
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
