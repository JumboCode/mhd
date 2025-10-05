"use client";

import React from "react";
import Button from "@/components/Button";

export default function ButtonPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Button Component Challenge
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Implement the Button component to fetch and display
                            random jokes from the API.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-blue-800 mb-3">
                                Requirements
                            </h2>
                            <ul className="text-blue-700 space-y-2">
                                <li>
                                    • Make the button text customizable (hint:
                                    learn about props!)
                                </li>
                                <li>
                                    • On click, fetch a random joke from{" "}
                                    <code className="bg-blue-100 px-1 rounded">
                                        https://official-joke-api.appspot.com/random_joke
                                    </code>
                                </li>
                                <li>
                                    • Display the joke setup and punchline below
                                    the button
                                </li>
                                <li>
                                    • Show &quot;Loading...&quot; while fetching
                                </li>
                                <li>• Handle error states</li>
                                <li>
                                    • Make the button look different when
                                    disabled (hint: more props!)
                                </li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-yellow-800 mb-3">
                                API Response Format
                            </h2>
                            <pre className="bg-yellow-100 p-3 rounded text-sm overflow-x-auto">
                                {`{
  "setup": "Why don't scientists trust atoms?",
  "punchline": "Because they make up everything!"
}`}
                            </pre>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-green-800 mb-3">
                                Learning Path
                            </h2>
                            <ol className="text-green-700 space-y-2">
                                <li>
                                    1. <strong>Props:</strong> Learn how to pass
                                    data to components using props
                                </li>
                                <li>
                                    2. <strong>State:</strong> Use useState to
                                    manage component data
                                </li>
                                <li>
                                    3. <strong>Events:</strong> Handle button
                                    clicks with onClick
                                </li>
                                <li>
                                    4. <strong>API Calls:</strong> Use fetch()
                                    to get data from the internet
                                </li>
                                <li>
                                    5. <strong>Conditional Rendering:</strong>{" "}
                                    Show different content based on state
                                </li>
                            </ol>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Your Implementation
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    Default Button
                                </h3>
                                <Button></Button>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    Button with Icon
                                </h3>
                                <Button></Button>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    Disabled Button
                                </h3>
                                <Button></Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-lg font-medium text-green-800 mb-2">
                            Validation Checklist
                        </h3>
                        <ul className="text-green-700 space-y-1">
                            <li>✅ Click triggers fetch to correct URL</li>
                            <li>✅ Displays both setup and punchline text</li>
                            <li>
                                ✅ Button state changes on hover/click/disabled
                            </li>
                            <li>
                                ✅ Loading state shows &quot;Loading...&quot;
                                text
                            </li>
                            <li>
                                ✅ Error handling displays user-friendly
                                messages
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
