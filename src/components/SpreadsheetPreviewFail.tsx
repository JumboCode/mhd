"use client";

import React, { ReactEventHandler, useState } from "react";

type PreviewProps = {
    file?: File;
};

export default function SpreadsheetPreviewFail({ file }: PreviewProps) {
    return (
        <div>
            <div className="flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mt-5">
                    This file can't be imported
                </h2>
                <p className="font-bold text-gray-500 mt-5">
                    Contains missing/unrecognized columns
                </p>
            </div>
        </div>
    );
}
