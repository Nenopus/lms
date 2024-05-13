import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware(
{
  publicRoutes: [ "/api/uploadthing","/api/webhook"],
}
  
);

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};