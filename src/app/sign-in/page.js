"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { LuTriangleAlert } from "react-icons/lu";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      router.push("/");
    } else if (res?.status === 401) {
      setError("Invalid Credentials");
      setPending(false);
    } else {
      setError("Something went wrong");
      setPending(false);
    }
  };

  const handleProvider = (e, provider) => {
    e.preventDefault();
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#1b0918] px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h2 className="text-xl font-bold text-center mb-1">Sign In</h2>
        <p className="text-sm text-center text-gray-500 mb-5">
          Use email or service to sign in
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-600 text-sm p-2 rounded mb-4">
            <LuTriangleAlert />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            disabled={pending}
            placeholder="Email"
            value={email}
            className="w-full border p-2 rounded focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            disabled={pending}
            placeholder="Password"
            value={password}
            className="w-full border p-2 rounded focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            Continue
          </button>
        </form>

        <div className="border-t my-4"></div>

        <div className="flex justify-center gap-6 mb-4">
          <button
            disabled={pending}
            onClick={(e) => handleProvider(e, "google")}
            className="p-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            <FcGoogle size={28} />
          </button>

          <button
            disabled={pending}
            onClick={(e) => handleProvider(e, "github")}
            className="p-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            <FaGithub size={28} />
          </button>
        </div>

        <p className="text-center text-sm text-gray-700">
          Create new account{" "}
          <Link className="text-blue-600 hover:underline" href="/sign-up">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
