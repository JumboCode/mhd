import React from "react";
import Demo from "../../components/Calendar";
import { MantineProvider } from "@mantine/core";
import "@mantine/dates/styles.css";

export default function Calendar() {
    return (
        <MantineProvider>
            <div className="min-h-screen flex justify-center items-center">
                <Demo />
            </div>
        </MantineProvider>
    );
}
