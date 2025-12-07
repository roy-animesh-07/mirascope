"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="w-full bg-green-400 text-white px-6 py-3 shadow-md flex justify-between items-center">
      <div
        onClick={() => router.push("/")}
        className="text-2xl font-extrabold cursor-pointer hover:opacity-90"
      >
        MiraScope
      </div>

      {session ? (
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="font-medium hover:underline"
          >
            {session.user?.name || "Dashboard"}
          </button>

          <button
            onClick={signOut}
            className="bg-white text-green-500 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-all"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/sign-in")}
            className="font-medium hover:underline"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/sign-up")}
            className="bg-white text-green-500 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-all"
          >
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
