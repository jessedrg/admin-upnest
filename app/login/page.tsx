"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Aurora } from "@/components/editorial/aurora";
import { Button, Input, Label } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast({ title: "Couldn't sign in", tone: "error" });
        setPending(false);
        return;
      }

      toast({ title: "Welcome back", tone: "success" });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      toast({ title: "Couldn't sign in", tone: "error" });
      setPending(false);
    }
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
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Your password"
            />
          </div>
          {error && (
            <p className="text-sm text-rust">{error}</p>
          )}
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
