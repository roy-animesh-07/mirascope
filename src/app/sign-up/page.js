"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { LuTriangleAlert } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/sign-in");
      } else if (res.status === 409) {
        setError("User already exists");
      } else {
        setError("Something went wrong");
      }
    } catch (err) {
      setError("Server error");
    }

    setPending(false);
  };

  const handleProvider = (e, provider) => {
    e.preventDefault();
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#1b0918] px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h2 className="text-xl font-bold text-center mb-1">Create Account</h2>
        <p className="text-sm text-center text-gray-500 mb-5">
          Sign up with your email or a provider
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-600 text-sm p-2 rounded mb-4">
            <LuTriangleAlert />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            disabled={pending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none"
            required
          />

          <input
            type="email"
            placeholder="Email"
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            disabled={pending}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none"
            required
          />

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            Sign Up
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

        <p className="text-center text-sm text-gray-700 mt-2">
          Already have an account{" "}
          <Link className="text-blue-600 hover:underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
