import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import { schema } from "./schema";
import { allowedEmails } from "./schema";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const GATED_EMAIL_OTP_PATHS = new Set([
    "/email-otp/send-verification-otp",
    "/sign-in/email-otp",
]);

async function isEmailAllowed(email: string): Promise<boolean> {
    const [row] = await getDb()
        .select({ id: allowedEmails.id })
        .from(allowedEmails)
        .where(eq(allowedEmails.email, email.trim().toLowerCase()))
        .limit(1);
    return Boolean(row);
}

// Lazily constructed for the same reason as getDb() — building this eagerly
// at module scope would touch DATABASE_URL/RESEND_API_KEY at import time and
// crash `next build` on a deploy where those aren't set yet.
function buildAuth() {
    const resend = new Resend(process.env.RESEND_API_KEY);

    return betterAuth({
        emailAndPassword: {
            enabled: false,
        },

        database: drizzleAdapter(getDb(), {
            provider: "pg",
            schema,
        }),

        hooks: {
            before: createAuthMiddleware(async (ctx) => {
                if (!GATED_EMAIL_OTP_PATHS.has(ctx.path)) return;
                const email = ctx.body?.email;
                if (typeof email !== "string") return;
                if (!(await isEmailAllowed(email))) {
                    throw new APIError("FORBIDDEN", {
                        message:
                            "This email hasn't been granted access. Ask an existing administrator to add you.",
                    });
                }
            }),
        },

        plugins: [
            nextCookies(),
            emailOTP({
                async sendVerificationOTP({ email, otp, type }) {
                    const subject =
                        type === "sign-in"
                            ? "Your Sign-In Code"
                            : type === "email-verification"
                              ? "Verify Your Email"
                              : "Reset Your Password";

                    await resend.emails.send({
                        from: process.env.EMAIL_FROM!,
                        to: email,
                        subject,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2>${subject}</h2>
                                <p>Your verification code is:</p>
                                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
                                    ${otp}
                                </div>
                                <p>This code will expire in 5 minutes.</p>
                                <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                            </div>
                        `,
                    });
                },
            }),
        ],
    });
}

let _auth: ReturnType<typeof buildAuth> | null = null;

export function getAuth(): ReturnType<typeof buildAuth> {
    if (!_auth) {
        _auth = buildAuth();
    }
    return _auth;
}
