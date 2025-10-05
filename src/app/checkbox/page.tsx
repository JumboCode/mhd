"use client";

import React from "react";
import Checkbox from "@/components/Checkbox";

export default function CheckboxPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Checkbox Component Challenge
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Implement the Checkbox component to fetch todos and
                            track multiple selections.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-blue-800 mb-3">
                                Requirements
                            </h2>
                            <ul className="text-blue-700 space-y-2">
                                <li>
                                    • Fetch 5 todos from{" "}
                                    <code className="bg-blue-100 px-1 rounded">
                                        https://jsonplaceholder.typicode.com/todos?_limit=5
                                    </code>{" "}
                                    when component loads
                                </li>
                                <li>
                                    • Display each todo as a checkbox with its
                                    title
                                </li>
                                <li>
                                    • Allow multiple selection (hint: learn
                                    about arrays and state!)
                                </li>
                                <li>
                                    • Display &quot;You selected X items&quot;
                                    counter that updates
                                </li>
                                <li>• Handle loading and error states</li>
                                <li>
                                    • Make checkboxes look nice with custom
                                    styling
                                </li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-yellow-800 mb-3">
                                API Response Format
                            </h2>
                            <pre className="bg-yellow-100 p-3 rounded text-sm overflow-x-auto">
                                {`[
  {
    "id": 1,
    "title": "delectus aut autem",
    "completed": false
  },
  {
    "id": 2,
    "title": "quis ut nam facilis et officia qui",
    "completed": false
  }
]`}
                            </pre>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Your Implementation
                        </h2>
                        <Checkbox />
                    </div>

                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-lg font-medium text-green-800 mb-2">
                            Validation Checklist
                        </h3>
                        <ul className="text-green-700 space-y-1">
                            <li>✅ Correct API call on mount</li>
                            <li>✅ Checkboxes toggle correctly</li>
                            <li>✅ Counter updates dynamically</li>
                            <li>
                                ✅ Shows &quot;You selected X items&quot;
                                message
                            </li>
                            <li>✅ Loading state during initial fetch</li>
                            <li>✅ Error handling for API failures</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
