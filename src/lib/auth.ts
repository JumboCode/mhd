import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { schema } from "./schema";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    emailAndPassword: {
        enabled: false,
    },

    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),

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
                    from: "mhd@shaynesidman.com", // TO DO: Replace with a different verfified domain in resend bc idk if we should use mine
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
