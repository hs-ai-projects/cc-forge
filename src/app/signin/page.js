"use client";

import { Suspense, useEffect } from "react";
import { authClient } from "@/auth-client";
import { useSearchParams } from "next/navigation";

function SignInInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    authClient.signIn.social({ provider: "feishu", callbackURL: callbackUrl });
  }, []);
  return null;
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}
