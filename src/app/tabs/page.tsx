"use client";

import React from "react";
import Tabs from "@/components/Tabs";

export default function TabsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Tabs Component Challenge
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Implement the Tabs component to create a dynamic
                            tabbed interface with product categories.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-blue-800 mb-3">
                                Requirements
                            </h2>
                            <ul className="text-blue-700 space-y-2">
                                <li>
                                    • Fetch categories from{" "}
                                    <code className="bg-blue-100 px-1 rounded">
                                        https://fakestoreapi.com/products/categories
                                    </code>{" "}
                                    when component loads
                                </li>
                                <li>
                                    • Create tabs dynamically from the fetched
                                    categories (hint: learn about map()!)
                                </li>
                                <li>
                                    • When a tab is clicked, fetch products from{" "}
                                    <code className="bg-blue-100 px-1 rounded">
                                        https://fakestoreapi.com/products/category/
                                        {"{category}"}
                                    </code>
                                </li>
                                <li>
                                    • Display product titles in the content area
                                </li>
                                <li>
                                    • Only one tab should be active at a time
                                    (hint: learn about state!)
                                </li>
                                <li>• Handle loading and error states</li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-yellow-800 mb-3">
                                API Response Formats
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-yellow-800 mb-1">
                                        Categories:
                                    </p>
                                    <pre className="bg-yellow-100 p-3 rounded text-sm overflow-x-auto">
                                        {`["electronics", "jewelery", "men's clothing", "women's clothing"]`}
                                    </pre>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-yellow-800 mb-1">
                                        Products:
                                    </p>
                                    <pre className="bg-yellow-100 p-3 rounded text-sm overflow-x-auto">
                                        {`[
  {
    "id": 1,
    "title": "Fjallraven - Foldsack No. 1 Backpack",
    "price": 109.95,
    "category": "men's clothing"
  }
]`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Your Implementation
                        </h2>
                        <Tabs />
                    </div>

                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-lg font-medium text-green-800 mb-2">
                            Validation Checklist
                        </h3>
                        <ul className="text-green-700 space-y-1">
                            <li>✅ Fetches category list correctly</li>
                            <li>✅ Clicking tab fetches new data</li>
                            <li>✅ Product titles render in panel</li>
                            <li>✅ Only one active tab at a time</li>
                            <li>✅ Loading states for both API calls</li>
                            <li>✅ Error handling for failed requests</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
