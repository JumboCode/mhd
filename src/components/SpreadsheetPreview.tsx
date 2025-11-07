"use client";

import React, { useState } from "react";
import { ExcelRenderer, OutTable } from "react-excel-renderer";

interface PreviewProps {
    file?: File;
}

export default function SpreadsheetPreview({ file }: PreviewProps) {
    const [cols, setCols] = useState<any[]>([]);
    const [rows, setRows] = useState<any[][]>([]);

    //Need cols e, n, r, t, u, v, x, y, AI, AL
    ExcelRenderer(file, (err: any, resp: any) => {
        if (err) {
            console.log(err);
        } else {
            const desiredIndexes = [4, 13, 17, 19, 20, 21, 23, 24, 34, 37];
            const cols = resp.cols.filter((col: any) =>
                desiredIndexes.includes(col.key),
            );

            setCols(cols);
            setRows(resp.rows.slice(0, 5));
        }
    });

    return (
        <div
            className="
                overflow-x-auto border border-gray-200 rounded-lg shadow-sm
                [&_table]:min-w-full
                [&_th_tr:first-child]:hidden  
                [&_tbody_tr:first-child]:hidden
                [&_th:first-child]:hidden
                [&_td:first-child]:hidden
                [&_thead]:bg-gray-100 [&_thead_tr]:sticky [&_thead_tr]:top-0
                [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-gray-700
                [&_tbody_tr:hover]:bg-gray-50
                [&_td]:px-4 [&_td]:py-2 [&_td]:text-sm [&_td]:text-gray-700"
        >
            {
                <OutTable
                    className=""
                    data={rows}
                    columns={cols}
                    tableClassName="table"
                />
            }
        </div>
    );
}
