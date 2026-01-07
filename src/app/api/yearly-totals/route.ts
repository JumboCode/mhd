// import { NextResponse } from "next/server";
// import { getYearlyStats } from "@/lib/yearlyTotals";

// export async function GET(req: Request) {
//     try {
//         const { searchParams } = new URL(req.url);
//         const year: string | null = searchParams.get("year");

//         if (year === null) {
//             return NextResponse.json(
//                 { error: "Expected year but received null" },
//                 { status: 400 },
//             );
//         }

//         const yearNum: number = parseInt(year);
//         const yearlyStats = await getYearlyStats(yearNum);

//         return NextResponse.json({ yearlyStats }, { status: 200 });
//     } catch (error) {
//         return NextResponse.json(
//             { message: "Failed to fetch yearly data" + error },
//             { status: 500 },
//         );
//     }
// }
