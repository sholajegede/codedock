"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import PageLoader from "@/components/page-loader";

function AuthHandler() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  if (!isSignedIn) {
    router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
    return null;
  }

  return null;
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthHandler />
      <main>{children}</main>
    </Suspense>
  );
}