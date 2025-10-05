"use client";

import React from "react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            MHS UI React Challenge
                        </h1>
                        <p className="text-xl text-gray-600 mb-6">
                            Complete the five component challenges to master
                            React development
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Link href="/button" className="group">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform group-hover:scale-105">
                                <div className="text-2xl mb-2">🔘</div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Button Component
                                </h3>
                                <p className="text-blue-100 text-sm">
                                    Fetch random jokes from the official joke
                                    API
                                </p>
                            </div>
                        </Link>

                        <Link href="/input" className="group">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform group-hover:scale-105">
                                <div className="text-2xl mb-2">📝</div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Input Component
                                </h3>
                                <p className="text-green-100 text-sm">
                                    Search GitHub users and display their
                                    profiles
                                </p>
                            </div>
                        </Link>

                        <Link href="/checkbox" className="group">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform group-hover:scale-105">
                                <div className="text-2xl mb-2">☑️</div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Checkbox Component
                                </h3>
                                <p className="text-purple-100 text-sm">
                                    Manage todo selections with dynamic counting
                                </p>
                            </div>
                        </Link>

                        <Link href="/tabs" className="group">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform group-hover:scale-105">
                                <div className="text-2xl mb-2">📑</div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Tabs Component
                                </h3>
                                <p className="text-orange-100 text-sm">
                                    Create dynamic tabs with product categories
                                </p>
                            </div>
                        </Link>

                        <Link href="/slider" className="group">
                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 transform group-hover:scale-105">
                                <div className="text-2xl mb-2">🎚️</div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Slider Component
                                </h3>
                                <p className="text-red-100 text-sm">
                                    Fetch trivia facts with debounced API calls
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
