"use server";

import { db } from "@/lib/db";
import { users, emailVerificationTokens, passwordResetTokens } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import crypto from "crypto";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const signupSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function signup(formData: FormData) {
    const validatedFields = signupSchema.safeParse({
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { email, password, username } = validatedFields.data;

    try {
        // Check if user exists
        const existing = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (existing) {
            return { error: "User already exists" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const [user] = await db
            .insert(users)
            .values({
                email,
                password: hashedPassword,
                username,
                provider: "local",
                emailVerified: false,
            })
            .returning();

        // Create verification token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

        await db.insert(emailVerificationTokens).values({
            userId: user.id,
            token,
            expiresAt,
            used: false,
        });

        // Send verification email
        await sendVerificationEmail(email, token);

        return { success: "Account created! Please check your email to verify your account." };
    } catch (error) {
        console.error("Signup error:", error);
        return { error: "Server error" };
    }
}

async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

    await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: email,
        subject: "Verify your email address",
        html: `
      <h1>Verify your email</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
    });
}

export async function verifyEmail(token: string) {
    if (!token) return { error: "Invalid token" };

    try {
        const verificationToken = await db.query.emailVerificationTokens.findFirst({
            where: and(
                eq(emailVerificationTokens.token, token),
                eq(emailVerificationTokens.used, false),
                gte(emailVerificationTokens.expiresAt, new Date())
            )
        });

        if (!verificationToken) {
            return { error: "Invalid or expired token" };
        }

        // Mark token as used
        await db
            .update(emailVerificationTokens)
            .set({ used: true })
            .where(eq(emailVerificationTokens.id, verificationToken.id));

        // Mark user as verified
        await db
            .update(users)
            .set({ emailVerified: true })
            .where(eq(users.id, verificationToken.userId));

        return { success: "Email verified successfully!" };
    } catch (error) {
        console.error("Verification error:", error);
        return { error: "Server error" };
    }
}

export async function resendVerification(email: string) {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user) return { error: "User not found" };
        if (user.emailVerified) return { error: "Email already verified" };

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await db.insert(emailVerificationTokens).values({
            userId: user.id,
            token,
            expiresAt,
            used: false,
        });

        await sendVerificationEmail(email, token);
        return { success: "Verification email sent!" };
    } catch (error) {
        console.error("Resend error:", error);
        return { error: "Server error" };
    }
}

export async function forgotPassword(email: string) {
    if (!email) return { error: "Email is required" };

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        // For security, don't reveal if user exists or not
        if (!user) {
            return { success: "If an account exists with that email, we've sent a reset link." };
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

        await db.insert(passwordResetTokens).values({
            userId: user.id,
            token,
            expiresAt,
            used: false,
        });

        await sendPasswordResetEmail(email, token);

        return { success: "If an account exists with that email, we've sent a reset link." };
    } catch (error) {
        console.error("Forgot password error:", error);
        return { error: "Server error" };
    }
}

async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

    await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: email,
        subject: "Reset your password",
        html: `
      <h1>Reset your password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `,
    });
}

export async function resetPassword(token: string, password: string) {
    if (!token || !password) return { error: "Invalid request" };
    if (password.length < 6) return { error: "Password must be at least 6 characters" };

    try {
        const resetToken = await db.query.passwordResetTokens.findFirst({
            where: and(
                eq(passwordResetTokens.token, token),
                eq(passwordResetTokens.used, false),
                gte(passwordResetTokens.expiresAt, new Date())
            )
        });

        if (!resetToken) {
            return { error: "Invalid or expired reset link" };
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password
        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, resetToken.userId));

        // Mark token as used
        await db
            .update(passwordResetTokens)
            .set({ used: true })
            .where(eq(passwordResetTokens.id, resetToken.id));

        return { success: "Password reset successfully!" };
    } catch (error) {
        console.error("Reset password error:", error);
        return { error: "Server error" };
    }
}
