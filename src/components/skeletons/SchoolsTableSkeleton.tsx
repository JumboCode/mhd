import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const COLUMN_SIZES = [200, 150, 150, 185, 210, 135, 135, 130] as const;
const ROW_COUNT = 20;

export function SchoolsTableSkeleton() {
    const totalWidth = COLUMN_SIZES.reduce((a, b) => a + b, 0);

    return (
        <div className="h-full w-full min-w-0 overflow-hidden border text-center">
            <Table
                className="caption-bottom text-sm border-separate border-spacing-0"
                style={{
                    width: totalWidth,
                    tableLayout: "fixed",
                }}
            >
                <TableHeader className="bg-muted">
                    <TableRow className="bg-muted hover:bg-muted border-0">
                        {COLUMN_SIZES.map((size, i) => (
                            <TableHead
                                key={i}
                                className={
                                    i === 0
                                        ? "sticky top-0 left-0 z-40 text-center bg-muted border-r border-b relative"
                                        : "sticky top-0 z-30 text-center border-r border-b bg-muted relative"
                                }
                                style={{
                                    width: size,
                                    maxWidth: size,
                                    position: "sticky",
                                    top: 0,
                                    ...(i === 0 && { left: 0 }),
                                }}
                            >
                                <Skeleton className="h-4 w-16 mx-auto" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: ROW_COUNT }).map((_, r) => (
                        <TableRow key={r}>
                            {COLUMN_SIZES.map((size, c) => (
                                <TableCell
                                    key={c}
                                    className={
                                        c === 0
                                            ? "text-center sticky left-0 z-20 bg-muted border-r border-b"
                                            : "text-center z-0 border-b"
                                    }
                                    style={{
                                        width: size,
                                        maxWidth: size,
                                        ...(c === 0 && {
                                            position: "sticky",
                                            left: 0,
                                        }),
                                    }}
                                >
                                    <div className="flex flex-row items-center justify-center h-12">
                                        <Skeleton
                                            className={`h-4 ${
                                                c === 0 ? "w-32" : "w-12"
                                            }`}
                                        />
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
