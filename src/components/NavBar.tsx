"use client";

import NavBarItem from "./NavBarItem";
import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="max-w-3xl">
            <div className="flex flex-row justify-center items-center mt-2 mx-4 bg-alt w-full rounded-3xl">
                <Link
                    href="/button"
                    className="py-1 px-2 hover:bg-second-alt transition duration-300"
                >
                    Button
                </Link>
                <Link
                    href="/checkbox"
                    className="py-1 px-2 hover:bg-second-alt transition duration-300"
                >
                    Checkbox
                </Link>
                <Link
                    href="/input"
                    className="py-1 px-2 hover:bg-second-alt transition duration-300"
                >
                    Input
                </Link>
                <Link
                    href="/slider"
                    className="py-1 px-2 hover:bg-second-alt transition duration-300"
                >
                    Slider
                </Link>
                <Link
                    href="/tabs"
                    className="py-1 px-2 hover:bg-second-alt transition duration-300"
                >
                    Tabs
                </Link>
            </div>
        </nav>
    );
}
