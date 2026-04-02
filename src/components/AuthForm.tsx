"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { DEV_BYPASS, DEV_BYPASS_COOKIE } from "@/lib/dev-config"; // TO DO - REMOVE: dev auth bypass
import { ArrowRightIcon } from "lucide-react";

// TO DO - REMOVE: dev auth bypass
function getDevBypassCookie(): boolean {
    if (typeof document === "undefined") return false;
    return document.cookie.includes(`${DEV_BYPASS_COOKIE}=1`);
}

export default function AuthForm({ redirectTo }: { redirectTo?: string }) {
    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const destination =
        redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
            ? redirectTo
            : "/";

    // TO DO - REMOVE: dev auth bypass - redirect if already signed in
    useEffect(() => {
        const checkAndRedirect = async () => {
            const sessionResult = await authClient.getSession();
            const session = sessionResult?.data ?? null;
            const isDevBypass = DEV_BYPASS && getDevBypassCookie();
            if (session || isDevBypass) {
                router.replace(destination);
            }
        };
        checkAndRedirect();
    }, [router, destination]);

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
            router.push(destination);
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
        } finally {
            setIsLoading(false);
        }
    }

    // TO DO - REMOVE: dev auth bypass
    function handleDevBypass() {
        // Set cookie so Sidebar and redirect logic know we're in dev mode
        document.cookie = `${DEV_BYPASS_COOKIE}=1; path=/; max-age=86400`;
        router.push(destination);
        router.refresh();
    }

    return (
        <div className="w-full md:w-1/2 h-full flex flex-col items-center p-6 overflow-y-auto">
            {/* Logo at top */}
            <div className="pt-8 pb-4">
                <Image
                    src="/images/mhs-logo-full.png"
                    alt="MHS Logo Image"
                    width={200}
                    height={100}
                    priority
                />
            </div>

            {/* Content centered */}
            <div className="flex-1 flex items-center justify-center w-full max-w-md">
                <div className="w-full flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold">Sign In</h1>
                        <p className="text-[#646464]">
                            Enter your email and a one time password will be
                            sent to you. If you do not have an account yet,
                            speak to an appropriate administrator at MHD.
                        </p>
                    </div>

                    <div className="w-full">
                        {step === "email" ? (
                            <form
                                onSubmit={handleSendCode}
                                className="space-y-8"
                            >
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm text-[#646464] mb-2"
                                    >
                                        Email
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                                        {error}
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    className="w-full bg-[#1447E6]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Sending..." : "Sign in"}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <form
                                    onSubmit={handleVerifyOtp}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label
                                            htmlFor="otp"
                                            className="block text-sm font-medium mb-2 text-[#646464]"
                                        >
                                            Code
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
                                        className="w-full bg-[#1447E6]"
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

                    {/* TO DO - REMOVE: dev auth bypass */}
                    {DEV_BYPASS && (
                        <div className="border border-dashed border-amber-400 rounded-lg p-4 bg-amber-50 flex flex-col gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDevBypass}
                                className="border-amber-400 bg-amber-400 hover:bg-amber-500 text-black text-sm"
                            >
                                Enter DEV MODE{" "}
                                <ArrowRightIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer at bottom */}
            <div className="pb-8">
                <p className="text-[#646464] text-sm">
                    Created with ❤️ by {}
                    <a
                        href="https://jumbocode.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                    >
                        JumboCode
                    </a>
                </p>
            </div>
        </div>
    );
}
