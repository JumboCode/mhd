import { NextResponse } from "next/server";

export async function GET() {
    try {
        // TODO: Replace this with the actual query when gatewayCities boolean field is added to schools table
        // Example query:
        // const gatewayCitiesResult = await db
        //     .select({ town: schools.town })
        //     .from(schools)
        //     .where(eq(schools.gatewayCity, true));
        // const gatewayCities = Array.from(
        //     new Set(gatewayCitiesResult.map((s) => s.town).filter(Boolean)),
        // ) as string[];

        // Temporary: Return empty array until gatewayCities field is added
        const gatewayCities: string[] = [];

        return NextResponse.json(gatewayCities);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
