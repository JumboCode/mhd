/***************************************************************
 *
 *         /src/components/ExportCartDrawer.tsx
 *
 *         Author: Amp
 *         Date: 4/8/2026
 *
 *         Summary: Bottom-right drawer (Vaul) showing the export
 *                  cart with item list and PDF export action
 **************************************************************/

"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import { clearCart, deleteFromCart, downloadGraphs } from "@/lib/export-to-pdf";

type ExportCartDrawerProps = {
    filterNames: string[];
    cart: string[];
    setCart: Dispatch<SetStateAction<string[]>>;
    setFilterNames: Dispatch<SetStateAction<string[]>>;
};

export function ExportCartDrawer({
    filterNames,
    cart,
    setCart,
    setFilterNames,
}: ExportCartDrawerProps) {
    const [isExporting, setIsExporting] = useState(false);

    return (
        <DrawerPrimitive.Root
            modal={false}
            shouldScaleBackground={false}
            direction="bottom"
        >
            <DrawerPrimitive.Trigger asChild>
                <button className="absolute bottom-4 right-8 z-40 flex items-center gap-3 rounded-xl border bg-background px-6 py-3 shadow-lg cursor-pointer hover:bg-accent transition-colors">
                    <span className="text-lg font-bold">Export Cart</span>
                    {cart.length > 0 && (
                        <span className="flex items-center justify-center min-w-6 h-6 rounded-full bg-red-500 text-white text-xs font-semibold px-1.5">
                            {cart.length}
                        </span>
                    )}
                </button>
            </DrawerPrimitive.Trigger>

            <DrawerPrimitive.Portal>
                <DrawerPrimitive.Content className="fixed bottom-0 right-8 z-50 flex h-auto max-h-[70vh] w-[400px] flex-col rounded-t-xl border bg-background shadow-xl outline-none">
                    <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-muted" />

                    <div className="flex items-center gap-3 px-6 pt-4 pb-2">
                        <DrawerPrimitive.Title className="text-2xl font-bold leading-none">
                            Export Cart
                        </DrawerPrimitive.Title>
                        {cart.length > 0 && (
                            <span className="flex items-center justify-center min-w-7 h-7 rounded-full bg-red-500 text-white text-sm font-semibold px-2">
                                {cart.length}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-2">
                        {cart.length === 0 ? (
                            <p className="text-muted-foreground text-sm py-8 text-center">
                                No items in cart. Add charts or maps to export
                                them as PDF.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {filterNames.map((name, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between gap-4 rounded-md px-3 py-2.5 hover:bg-accent transition-colors"
                                    >
                                        <p className="text-sm font-medium truncate">
                                            {name}
                                        </p>
                                        <button
                                            onClick={() =>
                                                deleteFromCart(
                                                    cart,
                                                    setCart,
                                                    filterNames,
                                                    setFilterNames,
                                                    index,
                                                )
                                            }
                                            className="text-muted-foreground hover:text-red-500 p-1 shrink-0 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 p-4 mt-auto">
                        {cart.length > 0 && (
                            <div className="flex items-center justify-between pb-1">
                                <button
                                    onClick={() =>
                                        clearCart(setCart, setFilterNames)
                                    }
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    className="w-full h-12 text-base"
                                    disabled={cart.length === 0 || isExporting}
                                >
                                    {isExporting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        "Export All"
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Export {cart.length} graph
                                        {cart.length !== 1 ? "s" : ""} to PDF?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will download a PDF containing{" "}
                                        {cart.length} graph
                                        {cart.length !== 1 ? "s" : ""} to your
                                        computer.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={async () => {
                                            setIsExporting(true);
                                            await downloadGraphs(
                                                cart,
                                                filterNames,
                                            );
                                            setIsExporting(false);
                                            toast.success(
                                                "Graphs exported successfully!",
                                            );
                                        }}
                                    >
                                        Download
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </DrawerPrimitive.Content>
            </DrawerPrimitive.Portal>
        </DrawerPrimitive.Root>
    );
}
