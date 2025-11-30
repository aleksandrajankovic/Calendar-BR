"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !pwd.trim()) {
      toast.error("Enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });
      if (!res.ok) {
        throw new Error();
      }
      toast.success("Login successful.");
      router.push("/admin/weekly-plan");
    } catch (err) {
      toast.error("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      {/* Left image */}
      <div className="bg-red-700 relative flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url('/img/Login.png')" }}
        />
        <div className="absolute inset-0 bg-red-900/60" />
      </div>

      {/* Right form */}
      <div className="bg-gray-100 flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6"
        >
          <h1 className="text-xl font-semibold text-[var(--black-white)] mb-4">
            Admin login
          </h1>

          <label className="block mb-3">
            <span className="text-sm font-roboto font-medium text-[var(--black-white)]">
              Email
            </span>
            <input
              type="email"
              className="mt-1 w-full border border-[#BDBDBD] rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="block mb-3">
            <span className="text-sm font-roboto font-medium text-[var(--black-white)]">
              Password
            </span>
            <input
              type="password"
              className="mt-1 w-full border border-[#BDBDBD] rounded px-3 py-2"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--green-primary)] uppercase hover:bg-green-700 transition text-white rounded py-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
