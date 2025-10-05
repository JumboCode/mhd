"use client";

import React from "react";
import Slider from "@/components/Slider";

export default function SliderPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Slider Component Challenge
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Implement the Slider component to fetch trivia facts
                            for numbers with debounced API calls.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-blue-800 mb-3">
                                Requirements
                            </h2>
                            <ul className="text-blue-700 space-y-2">
                                <li>
                                    • Show the current slider value (hint: learn
                                    about state!)
                                </li>
                                <li>
                                    • When slider moves, fetch trivia from{" "}
                                    <code className="bg-blue-100 px-1 rounded">
                                        http://numbersapi.com/{"{number}"}
                                        /trivia
                                    </code>
                                </li>
                                <li>• Display trivia text below the slider</li>
                                <li>
                                    • Don&apos;t fetch on every tiny movement -
                                    wait 500ms after user stops (hint: learn
                                    about debouncing!)
                                </li>
                                <li>• Handle loading and error states</li>
                                <li>
                                    • Make the slider look nice with custom
                                    styling
                                </li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-yellow-800 mb-3">
                                API Response Format
                            </h2>
                            <pre className="bg-yellow-100 p-3 rounded text-sm overflow-x-auto">
                                {`"7 is the number of days in a week."`}
                            </pre>
                            <p className="text-sm text-yellow-700 mt-2">
                                Note: The API returns plain text, not JSON.
                            </p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-purple-800 mb-3">
                                Testing Requirements
                            </h2>
                            <p className="text-purple-700 mb-2">
                                Add these data-testid attributes to your
                                elements for automated testing:
                            </p>
                            <ul className="text-purple-700 space-y-1 text-sm">
                                <li>
                                    •{" "}
                                    <code className="bg-purple-100 px-1 rounded">
                                        data-testid=&quot;trivia&quot;
                                    </code>{" "}
                                    - on the element that displays trivia
                                </li>
                                <li>
                                    •{" "}
                                    <code className="bg-purple-100 px-1 rounded">
                                        data-testid=&quot;loading&quot;
                                    </code>{" "}
                                    - on the loading state element
                                </li>
                                <li>
                                    •{" "}
                                    <code className="bg-purple-100 px-1 rounded">
                                        data-testid=&quot;error&quot;
                                    </code>{" "}
                                    - on the error message element
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Your Implementation
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    Default Slider
                                </h3>
                                <Slider />
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    Slider with Labels
                                </h3>
                                <Slider />
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    Disabled Slider
                                </h3>
                                <Slider />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-lg font-medium text-green-800 mb-2">
                            Validation Checklist
                        </h3>
                        <ul className="text-green-700 space-y-1">
                            <li>✅ Slider updates value state</li>
                            <li>✅ Calls correct API endpoint</li>
                            <li>✅ Trivia text updates per value</li>
                            <li>✅ Debounced fetch (500ms delay)</li>
                            <li>✅ Shows current numeric value</li>
                            <li>✅ Loading state during API calls</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
