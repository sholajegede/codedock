"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

function AuthHandler() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  if (!isSignedIn) {
    router.push("/sign-in");
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
    <>
      <AuthHandler />
      <main>{children}</main>
    </>
  );
}