import { edgeAuth } from "@/lib/auth-edge";

export default edgeAuth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  if (isAdmin && !req.auth) {
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
