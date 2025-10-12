import Link from "next/link";

type NavBarItemProps = {
    text: string;
};

export default function NavBarItem({ text }: NavBarItemProps) {
    return (
        <Link
            href={`${text}`}
            className="py-1 px-2 hover:bg-second-alt transition duration-300"
        >
            {text}
        </Link>
    );
}
