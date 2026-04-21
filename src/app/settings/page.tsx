/***************************************************************
 *
 *                page.tsx
 *
 *         Author: Will, Hansini, and Justin
 *           Date: 12/6/2025
 *
 *        Summary: Basic outline of settings page
 *
 **************************************************************/

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import YearsOfData, { YearsOfDataHandle } from "@/components/YearsOfData";
import GatewaySchools, {
    GatewaySchoolsHandle,
} from "@/components/GatewaySchools";
import {
    SchoolLocationEditor,
    type SchoolLocationEditorHandle,
} from "@/components/SchoolLocationEditor";
import { useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/components/UnsavedChangesContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function Settings() {
    const [otherHasChanges, setOtherHasChanges] = useState(false);
    const [yearsHasChanges, setYearsHasChanges] = useState(false);
    const hasUnsavedChanges = otherHasChanges || yearsHasChanges;
    const router = useRouter();
    const gatewaySchoolsRef = useRef<GatewaySchoolsHandle>(null);
    const yearsOfDataRef = useRef<YearsOfDataHandle>(null);
    const { setOnNavigationAttempt } = useUnsavedChanges();
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(
        null,
    );

    const schoolLocationRef = useRef<SchoolLocationEditorHandle>(null);

    const handleSave = async () => {
        try {
            await Promise.all([
                gatewaySchoolsRef.current?.save(),
                yearsOfDataRef.current?.save(),
                schoolLocationRef.current?.save(),
            ]);
            setOtherHasChanges(false);
            setYearsHasChanges(false);
        } catch {
            // save was cancelled (e.g. user dismissed a confirmation dialog)
        }
    };

    const handleDiscard = () => {
        gatewaySchoolsRef.current?.discard();
        yearsOfDataRef.current?.discard();
        schoolLocationRef.current?.discard();
        setOtherHasChanges(false);
        setYearsHasChanges(false);
    };

    const handleNavigationAttempt = useCallback(
        (href: string) => {
            if (hasUnsavedChanges) {
                setPendingNavigation(href);
                setShowUnsavedDialog(true);
            } else {
                router.push(href);
            }
        },
        [hasUnsavedChanges, router],
    );

    useEffect(() => {
        setOnNavigationAttempt(() => handleNavigationAttempt);
    }, [handleNavigationAttempt, setOnNavigationAttempt]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleDialogDiscard = () => {
        handleDiscard();
        setShowUnsavedDialog(false);
        if (pendingNavigation) router.push(pendingNavigation);
        setPendingNavigation(null);
    };

    const handleDialogSave = async () => {
        await handleSave();
        setShowUnsavedDialog(false);
        if (pendingNavigation) router.push(pendingNavigation);
        setPendingNavigation(null);
    };

    const handleDialogCancel = () => {
        setShowUnsavedDialog(false);
        setPendingNavigation(null);
    };

    return (
        <div className="flex flex-col gap-12 p-8 max-w-4xl pb-24">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold">Schools in Gateway Cities</h3>
                    <h4 className="mb-2">
                        Select schools that represent students from gateway
                        cities.
                    </h4>
                    <GatewaySchools
                        ref={gatewaySchoolsRef}
                        onUnsavedChange={() => setOtherHasChanges(true)}
                    />
                </div>
                <SchoolLocationEditor
                    ref={schoolLocationRef}
                    onUnsavedChange={() => setOtherHasChanges(true)}
                />
                <div className="space-y-3">
                    <h3 className="font-bold">Available Data</h3>
                    <YearsOfData
                        ref={yearsOfDataRef}
                        onUnsavedChange={() => setYearsHasChanges(true)}
                        onAllChangesReverted={() => setYearsHasChanges(false)}
                    />
                </div>
            </div>

            <div
                className={`fixed bottom-0 left-56 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/20 backdrop-blur-md shadow-lg transition-transform duration-200 ease-in-out ${hasUnsavedChanges ? "translate-y-0" : "translate-y-full"}`}
            >
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                    You have unsaved changes — save?
                </span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDiscard}>
                        Discard Changes
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                        Save
                    </Button>
                </div>
            </div>
            {/* If user tries to leave page with unsaved changes */}
            <Dialog open={showUnsavedDialog} onOpenChange={handleDialogCancel}>
                <DialogContent
                    showCloseButton={false}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes. What would you like to do?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDialogCancel}>
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={handleDialogDiscard}>
                            Discard Changes
                        </Button>
                        <Button onClick={handleDialogSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
