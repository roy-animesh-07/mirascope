"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apikey, setApikey] = useState("");
  const [changeApiKey, setChangeApiKey] = useState(false);
  const [haskey, setHaskey] = useState(false);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleApiKeyUpdate = async () => {
    if (!apikey) {
      alert("API key cannot be empty");
      return;
    }

    const res = await fetch("/api/setApiKey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: apikey }),
    });

    if (res.ok) {
      setChangeApiKey(false);
      setApikey("");
      setHaskey(true);
      alert("API key updated");
    } else {
      alert("Failed to update API key");
    }
  };

  useEffect(() => {
    if (session) {
      fetch("/api/userHasApiKey")
        .then((res) => res.json())
        .then((data) => {
          setHaskey(data.hasKey);
        });
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      try {
        fetch("/api/reports")
          .then((res) => res.json())
          .then((data) => {
            setReports(data);
            setLoading(false);
          });
      } catch (err) {
        console.log(err);
      }
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }
  const handleView = (id) => {
    router.push(`/view/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="grow px-6 py-10">
        <div className="flex justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-lg mb-6">Welcome, {session.user.name}!</p>
          </div>
          <div>
            <button
              onClick={() => {
                setChangeApiKey(!changeApiKey);
              }}
              className="bg-amber-200 p-3 rounded-2xl"
            >
              Change APiKey{" "}
            </button>
            {changeApiKey && (
              <input
                type="text"
                value={apikey}
                onChange={(e) => setApikey(e.target.value)}
                placeholder="Enter new API key"
                className="border px-3 py-2 rounded mb-2 w-full"
              />
            )}

            {changeApiKey && (
              <button
                onClick={handleApiKeyUpdate}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Save
              </button>
            )}
            {haskey && !changeApiKey && (
              <p className="text-sm text-green-600 font-medium">
                ✓ API key linked
              </p>
            )}
          </div>
        </div>
        {reports.length === 0 ? (
          <p className="text-gray-500">No reports saved yet.</p>
        ) : (
          <div className="grid gap-4">
            {reports.map((r) => (
              <div
                key={r._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm
             hover:shadow-md transition-shadow flex flex-col gap-2"
              >
                <p className="text-lg font-bold text-gray-500 truncate">
                  {r.report?.fileName ?? "Untitled Report"}
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleString()}
                </p>

                <p className="text-sm font-medium text-gray-700">
                  {r.report.questions.length} questions analyzed
                </p>

                <button
                  className="mt-3 self-start rounded-lg bg-black px-4 py-1.5
               text-sm text-white hover:bg-gray-800 transition"
                  onClick={() => handleView(r._id)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
