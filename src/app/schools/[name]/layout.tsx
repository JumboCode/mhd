export async function generateMetadata({
    params,
}: {
    params: Promise<{ name: string }>;
}) {
    const { name } = await params;
    const decoded = decodeURIComponent(name)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return { title: decoded };
}

export default function SchoolProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
