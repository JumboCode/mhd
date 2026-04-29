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
    const [gatewayDirty, setGatewayDirty] = useState(false);
    const [locationDirty, setLocationDirty] = useState(false);
    const [yearsHasChanges, setYearsHasChanges] = useState(false);
    const hasUnsavedChanges = gatewayDirty || locationDirty || yearsHasChanges;
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
            setGatewayDirty(false);
            setLocationDirty(false);
            setYearsHasChanges(false);
        } catch {
            // save was cancelled (e.g. user dismissed a confirmation dialog)
        }
    };

    const handleDiscard = () => {
        gatewaySchoolsRef.current?.discard();
        yearsOfDataRef.current?.discard();
        schoolLocationRef.current?.discard();
        setGatewayDirty(false);
        setLocationDirty(false);
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
        <div className="mx-auto max-w-6xl px-8 py-10 pb-32">
            <h1 className="text-3xl font-bold tracking-tight text-balance">
                Settings
            </h1>

            <div className="mt-6 divide-y divide-border">
                <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-x-12 gap-y-4 py-10">
                    <div>
                        <h2 className="font-semibold text-balance">
                            Schools in Gateway Cities
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground text-pretty">
                            Select schools that represent students from gateway
                            cities.
                        </p>
                    </div>
                    <div>
                        <GatewaySchools
                            ref={gatewaySchoolsRef}
                            onDirtyChange={setGatewayDirty}
                        />
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-x-12 gap-y-4 py-10">
                    <div>
                        <h2 className="font-semibold text-balance">
                            School Locations
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground text-pretty">
                            Update a school&apos;s coordinates by selecting it
                            and clicking on the map.
                        </p>
                    </div>
                    <div>
                        <SchoolLocationEditor
                            ref={schoolLocationRef}
                            onUnsavedChange={() => setLocationDirty(true)}
                        />
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-x-12 gap-y-4 py-10">
                    <div>
                        <h2 className="font-semibold text-balance">
                            Available Data
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground text-pretty">
                            Review which years of project data are loaded and
                            remove old years.
                        </p>
                    </div>
                    <div>
                        <YearsOfData
                            ref={yearsOfDataRef}
                            onUnsavedChange={() => setYearsHasChanges(true)}
                            onAllChangesReverted={() =>
                                setYearsHasChanges(false)
                            }
                        />
                    </div>
                </section>
            </div>

            {/* Save bar */}
            <div
                className={`fixed bottom-0 left-56 right-0 z-50 border-t border-border bg-background/60 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                    hasUnsavedChanges ? "translate-y-0" : "translate-y-full"
                }`}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="relative inline-flex h-2 w-2 shrink-0">
                            <span className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-75" />
                            <span className="absolute inset-0 rounded-full bg-amber-400" />
                        </span>
                        Unsaved changes
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDiscard}
                            className="transition-transform active:scale-[0.96]"
                        >
                            Discard
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            className="transition-transform active:scale-[0.96]"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
            {/* If user tries to leave page with unsaved changes */}
            <Dialog
                open={showUnsavedDialog}
                onOpenChange={(open) => {
                    // Esc → discard changes and continue with navigation
                    if (!open) handleDialogDiscard();
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="text-balance">
                            Unsaved Changes
                        </DialogTitle>
                        <DialogDescription className="text-pretty">
                            You have unsaved changes. What would you like to do?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleDialogCancel}
                            className="transition-transform active:scale-[0.96]"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDialogDiscard}
                            className="text-white transition-transform active:scale-[0.96]"
                        >
                            Discard Changes
                        </Button>
                        <Button
                            onClick={handleDialogSave}
                            className="transition-transform active:scale-[0.96]"
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
