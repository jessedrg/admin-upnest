"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Aurora } from "@/components/editorial/aurora";
import { Button, Input, Label } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      toast({ title: "Couldn't sign in", tone: "error" });
      return;
    }
    toast({ title: "Welcome back", tone: "success" });
    router.push("/dashboard");
  }

  return (
    <div className="relative min-h-screen grid place-items-center bg-paper px-6">
      <Aurora intensity={0.7} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="serif text-[44px] leading-none">Upnest</div>
          <div className="label mt-2">Admin — sign in</div>
        </div>
        <form
          onSubmit={onSubmit}
          className="card p-6 space-y-4 backdrop-blur-sm"
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="alex@upnest.example"
              defaultValue="alex@upnest.example"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              defaultValue="anything"
            />
          </div>
          <Button
            type="submit"
            className="w-full justify-center"
            disabled={pending}
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          
        </form>
        <p className="serif italic text-center text-t-3 text-sm mt-6">
          Operations console.
        </p>
      </div>
    </div>
  );
}
