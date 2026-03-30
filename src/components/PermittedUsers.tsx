/***************************************************************
 *
 *                /components/ui/PermittedUsers.tsx
 *
 *         Author: Justin
 *           Date: 3/24/2026
 *
 *        Summary: Component for displaying permitted users
 *                 with email validation and user management
 *
 **************************************************************/

"use client";

import { useState } from "react";
import { Trash, Plus } from "lucide-react";

interface PermittedUser {
    email: string;
    lastSignIn: string;
}

export default function PermittedUsers({
    onUnsavedChange,
}: {
    onUnsavedChange?: () => void;
}) {
    const [emailInput, setEmailInput] = useState("");
    const [permittedUsers, setPermittedUsers] = useState<PermittedUser[]>([
        {
            email: "something@mhd.com",
            lastSignIn: "3 days ago",
        },
        {
            email: "something@mhd.com",
            lastSignIn: "3 days ago",
        },
        {
            email: "something@mhd.com",
            lastSignIn: "3 days ago",
        },
    ]);

    // Email validation function
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Runs through the process of adding a new user
    const handleAddUser = () => {
        const trimmedEmail = emailInput.trim();

        // Validate email format
        if (!isValidEmail(trimmedEmail)) {
            alert("Please enter a valid email address");
            return;
        }

        // Check for duplicates
        if (
            permittedUsers.some(
                (user) =>
                    user.email.toLowerCase() === trimmedEmail.toLowerCase(),
            )
        ) {
            alert("This email is already in the permitted users list");
            return;
        }

        // Add new user
        setPermittedUsers([
            ...permittedUsers,
            {
                email: trimmedEmail,
                lastSignIn: "3 days ago",
            },
        ]);
        onUnsavedChange?.();

        setEmailInput("");
    };

    // Remove permitted user
    const handleRemoveUser = (email: string) => {
        setPermittedUsers(
            permittedUsers.filter((user) => user.email !== email),
        );
        onUnsavedChange?.();
    };

    // Handle Enter key press
    const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleAddUser();
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="font-bold">Permitted Users</h3>
            <p className="text-sm">
                These emails are permitted to sign into the platform. Here you
                can also revoke access
            </p>
            <div className="flex rounded-lg border shadow-sm overflow-hidden w-72">
                <input
                    type="email"
                    placeholder="Email"
                    aria-label="Email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    className="flex-1 px-4 py-1 text-base text-gray-900 placeholder-gray-900 outline-none"
                />
                <button
                    type="button"
                    onClick={handleAddUser}
                    aria-label="Add Email"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors w-8 flex items-center justify-center border-l border-gray-300"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="border-b-2 border-gray-200 divide-x-2">
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                                Email
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                                Last Signed In
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {permittedUsers.map((user, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">
                                    {user.email}
                                </td>
                                <td className="px-4 py-3 text-sm text-center">
                                    {user.lastSignIn}
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() =>
                                            handleRemoveUser(user.email)
                                        }
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        aria-label={`Remove ${user.email}`}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
