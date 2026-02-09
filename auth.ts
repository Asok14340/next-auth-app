import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db"; // Fixed import path
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await db.query.users.findFirst({
                        where: eq(users.email, email),
                    });

                    console.log("Authorize - User found for email:", email, !!user);
                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    console.log("Authorize - Passwords match:", passwordsMatch);
                    if (passwordsMatch) return { ...user, id: String(user.id) };
                }

                console.log("Authorize - Failed or invalid credentials");
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                // Add other fields you want in the token
                // We can fetch the user from DB to get fresh data if needed, 
                // but `user` object here comes from `authorize` or provider.
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google' || account?.provider === 'github') {
                // Check if user exists
                const existingUser = await db.query.users.findFirst({
                    where: eq(users.email, user.email!),
                });

                if (!existingUser) {
                    // Create new user
                    await db.insert(users).values({
                        email: user.email!,
                        username: user.name ?? user.email!.split('@')[0],
                        provider: account.provider,
                        emailVerified: true, // OAuth emails are verified
                        googleId: account.provider === 'google' ? account.providerAccountId : undefined,
                        githubId: account.provider === 'github' ? account.providerAccountId : undefined,
                        avatar: user.image,
                    });
                } else {
                    // Link account if needed or just update
                    // For now, simple check.
                }
            }
            return true;
        }
    },
    pages: {
        signIn: "/login", // We will create this page
    },
    session: {
        strategy: "jwt",
    }
});
