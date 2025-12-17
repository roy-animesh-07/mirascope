"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 w-full bg-green-100 backdrop-blur-md border-b border-green-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        <div
          onClick={() => router.push("/")}
          className="text-xl font-bold cursor-pointer tracking-tight transition hover:opacity-90"
        >
          <span className="text-green-600">Mira</span>
          <span className="text-green-900">Scope</span>
        </div>

        {session ? (
          <div className="flex items-center gap-4">

            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm font-medium text-green-800 hover:text-green-600 transition"
            >
              Dashboard
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-200 text-green-900 flex items-center justify-center text-sm font-semibold">
                {session.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden sm:block text-sm text-green-900">
                {session.user?.name}
              </span>
            </div>

        
            <button
              onClick={() => {
                signOut();
                router.push("/");
              }}
              className="text-sm px-4 py-1.5 rounded-md border border-green-300 text-green-900 hover:bg-green-300 transition"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">

            <button
              onClick={() => router.push("/sign-in")}
              className="text-sm font-medium text-green-800 hover:text-green-600 transition"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/sign-up")}
              className="text-sm px-4 py-1.5 rounded-md bg-green-500 text-white hover:bg-green-600 transition shadow-sm"
            >
              Sign up
            </button>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
