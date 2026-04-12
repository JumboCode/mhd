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

import {
    ChartColumn,
    LineChart,
    Loader2,
    MapIcon,
    ShoppingCart,
    Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCart, type CartItem } from "@/hooks/useCart";
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

function getFilterCount(item: CartItem): number {
    if (item.type !== "chart") return 0;
    const f = item.params.filters;
    let count = 0;
    if (f.selectedSchools.length > 0) count++;
    if (f.selectedCities.length > 0) count++;
    if (f.selectedProjectTypes.length > 0) count++;
    if (f.teacherYearsValue) count++;
    if (f.onlyGatewaySchools) count++;
    return count;
}

function CartItemRow({
    item,
    onRemove,
}: {
    item: CartItem;
    onRemove: () => void;
}) {
    const filterCount = getFilterCount(item);

    return (
        <div className="flex gap-3 items-start rounded-lg border p-3">
            <div className="mt-0.5 text-muted-foreground">
                {item.type === "map" ? (
                    <MapIcon className="h-4 w-4" />
                ) : item.params.chartType === "bar" ? (
                    <ChartColumn className="h-4 w-4" />
                ) : (
                    <LineChart className="h-4 w-4" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug">
                    {item.filterName}
                </p>
                <div className="flex gap-1 flex-wrap mt-1.5">
                    {item.type === "chart" ? (
                        <>
                            <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                            >
                                {item.params.chartType === "bar"
                                    ? "Bar"
                                    : "Line"}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0"
                            >
                                {item.params.yearStart === item.params.yearEnd
                                    ? item.params.yearStart
                                    : `${item.params.yearStart}–${item.params.yearEnd}`}
                            </Badge>
                        </>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                        >
                            Heatmap
                        </Badge>
                    )}
                    {filterCount > 0 && (
                        <Badge className="text-[10px] px-1.5 py-0">
                            {filterCount} filter{filterCount !== 1 ? "s" : ""}
                        </Badge>
                    )}
                </div>
            </div>
            <button
                onClick={onRemove}
                className="text-gray-400 hover:text-red-500 p-1 transition-colors duration-150 ease-in-out shrink-0"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

export function Cart() {
    const { items, removeItem, clearCart, exportAll, isExporting } = useCart();

    return (
        <div className="flex flex-col justify-between h-full gap-2 pt-2 pb-6">
            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                        <ShoppingCart className="h-10 w-10 stroke-1" />
                        <div className="text-center">
                            <p className="text-sm font-medium">Cart is empty</p>
                            <p className="text-xs mt-1">
                                Add charts or maps using the &quot;Add to&quot;
                                button
                            </p>
                        </div>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <CartItemRow
                            key={index}
                            item={item}
                            onRemove={() => removeItem(index)}
                        />
                    ))
                )}
            </div>
            <div
                className={`flex flex-row justify-between items-center ${items.length > 0 && "border-t pt-2"}`}
            >
                <button
                    onClick={() => clearCart()}
                    className="hover:cursor-pointer pl-2 text-sm"
                >
                    Clear All
                </button>
                {items.length === 0 ? (
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
                                    Export {items.length} graph
                                    {items.length !== 1 ? "s" : ""} to PDF?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will download a PDF containing{" "}
                                    {items.length} graph
                                    {items.length !== 1 ? "s" : ""} to your
                                    computer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => exportAll()}>
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
