export async function generateMetadata({
    params,
}: {
    params: Promise<{ name: string; town: string }>;
}) {
    const { name, town } = await params;
    const decodedName = decodeURIComponent(name)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    const decodedTown = decodeURIComponent(town)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return { title: `${decodedName} — ${decodedTown}` };
}

export default function SchoolProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
