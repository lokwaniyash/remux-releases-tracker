import Link from "next/link";

export default function Header() {
    return (
        <header className="bg-gray-800 border-b border-gray-700">
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-semibold">
                    Remux Releases
                </Link>
                <Link
                    href="/calendar"
                    className="px-4 py-2 rounded-md hover:bg-gray-700"
                >
                    Calendar
                </Link>
            </nav>
        </header>
    );
}
