/***************************************************************
 *
 *         /src/components/cart.tsx
 *
 *         Author: Will and Justin
 *         Date: 2/1/2025
 *
 *        Summary: Displays cart of images to export when
 *                 hovering over cart button
 **************************************************************/

import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { clearCart, deleteFromCart, downloadGraphs } from "@/lib/export-to-pdf";
import { Dispatch, SetStateAction } from "react";

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
    return (
        <div className="flex flex-col gap-2 w-full max-w-5xl px-3 py-1 mr-5">
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
                                filterName,
                            )
                        }
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors duration-150 ease-in-out"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ))}
            <div
                className={`flex flex-row gap-7 ${cart.length > 0 ? "border-t pt-2" : ""}`}
            >
                <button
                    onClick={() => clearCart(setCart, setFilterNames)}
                    className="hover:cursor-pointer"
                >
                    Clear All
                </button>
                <Button onClick={() => downloadGraphs(cart, filterNames)}>
                    Export To PDF
                </Button>
            </div>
        </div>
    );
}
