"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import * as f from "@/lib/schema";

export default function ExampleFetch() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const getData = async () => {
            const data = await db.select().from(f.teacherSchools);
            console.log(data);
        };

        getData();
    }, []);

    return <>{data}</>;
}
