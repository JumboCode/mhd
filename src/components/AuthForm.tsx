"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AuthForm() {
    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();

    async function handleSendCode(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError(""); // TO DO: Change error handling to toast
        try {
            await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "sign-in",
            });
            setStep("otp");
        } catch (error) {
            setError("Failed to send verification code. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await authClient.signIn.emailOtp({
                email,
                otp,
            });
            router.push("/");
        } catch (error) {
            setError("Invalid or expired code. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResendCode() {
        setIsLoading(true);
        setError("");
        try {
            await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "sign-in",
            });
            setOtp("");
        } catch (err) {
            setError("Failed to resend code. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-center">
                {step === "email" ? "Sign In" : "Enter Verification Code"}
            </h1>

            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                    {error}
                </div>
            )}

            {step === "email" ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-2"
                        >
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send Code"}
                    </Button>
                </form>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center">
                        We sent a 6-digit code to {email}
                    </p>
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label
                                htmlFor="otp"
                                className="block text-sm font-medium mb-2"
                            >
                                Verification Code
                            </label>
                            <Input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6),
                                    )
                                }
                                placeholder="123456"
                                maxLength={6}
                                required
                                className="text-center text-2xl tracking-widest"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying..." : "Verify"}
                        </Button>
                    </form>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={handleResendCode}
                            disabled={isLoading}
                        >
                            Resend Code
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                setStep("email");
                                setOtp("");
                                setError("");
                            }}
                        >
                            Change Email
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
