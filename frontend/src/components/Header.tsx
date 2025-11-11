import Link from "next/link";
import Image from "next/image";

export default function Header() {
    return (
        <header className="bg-gray-800 border-b border-gray-700">
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex-shrink-0">
                    <Image
                        src="/favicon-remux-1.png"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="rounded"
                    />
                </Link>
                <div className="flex gap-4">
                    <Link href="/" className="px-4 py-2 text-gray-200 rounded-md hover:bg-gray-700">
                        Home
                    </Link>
                    <Link
                        href="/calendar"
                        className="px-4 py-2 text-gray-200 rounded-md hover:bg-gray-700"
                    >
                        Calendar
                    </Link>
                </div>
            </nav>
        </header>
    );
}
