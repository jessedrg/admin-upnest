import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const Login = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const parsed = Login.safeParse(creds);
        if (!parsed.success) return null;
        // STUB — replace with real auth
        return {
          id: "u_me",
          name: "Alex Reyes",
          email: parsed.data.email,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const onAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/signup");
      if (loggedIn && onAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      const isApp = nextUrl.pathname.startsWith("/(app)");
      // Permissive in dev: allow everything by default
      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
