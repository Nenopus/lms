import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(
{
  publicRoutes: [ "/api/webhook"],
}
  
);

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};