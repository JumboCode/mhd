/***************************************************************
 *
 *                /not-found.tsx
 *
 *         Author: Elki
 *           Date: 4/7/2025
 *
 *        Summary: Reroutes user to homepage on 404 (invalid URL)
 *
 **************************************************************/
import { redirect } from "next/navigation";

export default function NotFound() {
    redirect("/?toast=invalid-url");
}
