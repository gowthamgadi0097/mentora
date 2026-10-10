export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/tutor/:path*", "/quiz/:path*", "/notes/:path*", "/planner/:path*"],
};
