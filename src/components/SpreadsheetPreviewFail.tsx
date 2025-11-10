"use client";

import React, { ReactEventHandler, useState } from "react";

type PreviewProps = {
    file?: File;
};

export default function SpreadsheetPreviewFail({ file }: PreviewProps) {
    return (
        <div>
            <div className="flex flex-col items-left justify-left pb-10">
                <h1>This file can't be imported</h1>
                <p>Contains missing/unrecognized columns</p>
            </div>
        </div>
    );
}
