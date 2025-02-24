import Credentials from "@auth/core/providers/credentials";
import { defineConfig } from "auth-astro";

export default defineConfig({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "name" },
        email: { label: "email", type: "email" },
      },
      async authorize(credentials) {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials), //TODO: add api key
        });
        const user = await response.json();
        if (response.ok && user) {
          return user;
        }
        throw new Error("Something went wrong");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return { ...user, ...token };
      }
      return token;
    },
    async session({ session, token }) {
      if (token.refresh_token) {
      }
      return { ...session, ...token };
    },
  },
});
