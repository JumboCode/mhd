import { useState } from "react";

type UseExportCartState = {
    cart: string[];
    filterNames: string[];
};

export function useExportCart() {
    const [cart, setCart] = useState<string[]>([]);
    const [filterNames, setFilterNames] = useState<string[]>([]);

    const addToCart = (id: string, filterName: string) => {
        setCart((prev) => [...prev, id]);
        setFilterNames((prev) => [...prev, filterName]);
    };

    const removeFromCart = (id: string) => {
        setCart((prevCart) => {
            const idx = prevCart.indexOf(id);
            if (idx === -1) return prevCart;

            setFilterNames((prevNames) =>
                prevNames.filter((_, index) => index !== idx),
            );
            return prevCart.filter((_, index) => index !== idx);
        });
    };

    const clearCart = () => {
        setCart([]);
        setFilterNames([]);
    };

    const setExportCart = ({ cart, filterNames }: UseExportCartState) => {
        setCart(cart);
        setFilterNames(filterNames);
    };

    return {
        cart,
        filterNames,
        addToCart,
        removeFromCart,
        clearCart,
        setExportCart,
    };
}
