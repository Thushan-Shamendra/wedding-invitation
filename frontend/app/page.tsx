import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F8F6F1] text-[#26231F]">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E8E3DA] p-8 sm:p-10 shadow-sm text-center">
        {/* Monogram / Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F8F6F1] border border-[#E8E3DA] text-[#C9A96E] mb-6">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-serif text-[#26231F] tracking-tight mb-2">
          Wedding Invitation
        </h1>
        <p className="text-sm text-[#746E66] mb-8">
          Welcome to the wedding invitation portal. Access the administration dashboard below.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-[#C9A96E] hover:bg-[#B89658] active:bg-[#A68345] text-white font-medium shadow-sm transition-all duration-200"
          >
            Go to Admin Login
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E8E3DA]/80">
          <p className="text-xs text-[#746E66]/80">
            Admin URL: <code className="bg-[#F8F6F1] px-1.5 py-0.5 rounded text-[#26231F]">/admin/login</code>
          </p>
        </div>
      </div>
    </div>
  );
}
