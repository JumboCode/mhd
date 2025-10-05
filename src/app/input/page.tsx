"use client";

import React from "react";
import Input from "@/components/Input";

export default function InputPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Input Component Challenge
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Implement the Input component to search for GitHub
                            users and display their information.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-blue-800 mb-3">
                                Requirements
                            </h2>
                            <ul className="text-blue-700 space-y-2">
                                <li>
                                    • Make the input placeholder customizable
                                    (hint: learn about props!)
                                </li>
                                <li>
                                    • User types a GitHub username and presses
                                    Enter (hint: learn about events!)
                                </li>
                                <li>
                                    • Fetch user data from{" "}
                                    <code className="bg-blue-100 px-1 rounded">
                                        https://api.github.com/users/
                                        {"{username}"}
                                    </code>
                                </li>
                                <li>
                                    • Display avatar + username below the input
                                </li>
                                <li>
                                    • Handle error states (user not found, etc.)
                                </li>
                                <li>• Show loading state during API calls</li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-yellow-800 mb-3">
                                API Response Format
                            </h2>
                            <pre className="bg-yellow-100 p-3 rounded text-sm overflow-x-auto">
                                {`{
  "login": "octocat",
  "avatar_url": "https://github.com/images/error/octocat_happy.gif",
  "name": "The Octocat"
}`}
                            </pre>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Your Implementation
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    Default Input
                                </h3>
                                <Input />
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    Input with Search Icon
                                </h3>
                                <Input />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-lg font-medium text-green-800 mb-2">
                            Validation Checklist
                        </h3>
                        <ul className="text-green-700 space-y-1">
                            <li>✅ Input field triggers correct API call</li>
                            <li>✅ Avatar + name display correctly</li>
                            <li>✅ Hover/focus states visible</li>
                            <li>✅ Enter key triggers search</li>
                            <li>✅ Error handling for 404 (user not found)</li>
                            <li>✅ Loading state during API calls</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
