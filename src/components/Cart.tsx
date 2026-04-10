/***************************************************************
 *
 *         /src/components/cart.tsx
 *
 *         Author: Will and Justin
 *         Date: 2/1/2025
 *
 *         Modified by Steven on 3/24/26
 *
 *        Summary: Displays cart of images to export when
 *                 hovering over cart button
 **************************************************************/

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { downloadGraphs } from "@/lib/export-to-pdf";
import { clearCart, deleteFromCart } from "@/lib/cart-db";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

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
} from "@/components/ui/alert-dialog";

type CartProps = {
    filterNames: string[];
    cart: string[];
    setCart: Dispatch<SetStateAction<string[]>>;
    setFilterNames: Dispatch<SetStateAction<string[]>>;
};

export function Cart({
    filterNames,
    cart,
    setCart,
    setFilterNames,
}: CartProps) {
    const [isExporting, setIsExporting] = useState(false);
    return (
        <div className="flex flex-col gap-2 p-2 w-full max-w-5xl">
            {filterNames.map((filterName, index) => (
                <div
                    key={index}
                    className="flex flex-row gap-4 justify-between"
                >
                    <p>{filterName}</p>
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
                        className="text-gray-400 hover:text-red-500 p-1 pr-2 transition-colors duration-150 ease-in-out"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ))}
            <div
                className={`flex flex-row justify-between ${cart.length > 0 && "border-t pt-2"}`}
            >
                <button
                    onClick={() => clearCart(setCart, setFilterNames)}
                    className="hover:cursor-pointer pl-2"
                >
                    Clear All
                </button>
                {cart.length === 0 ? (
                    <Button
                        className="min-w-32"
                        onClick={() => toast.error("Cart is empty")}
                    >
                        Export All
                    </Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={isExporting} className="min-w-32">
                                {isExporting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
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
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={async () => {
                                        setIsExporting(true);
                                        await downloadGraphs(cart, filterNames);
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
                )}
            </div>
        </div>
    );
}
