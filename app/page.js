"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [showGuide, setShowGuide] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ""; // Admin email from environment variables

  // Fetch the allowed emails from the server
  useEffect(() => {
    if (session?.user.email === adminEmail) {
      fetch("/api/emails")
        .then((res) => res.json())
        .then((data) => setAllowedEmails(data.allowedEmails))
        .catch((err) => console.error("Failed to fetch allowed emails:", err));
    }
  }, [session, adminEmail]);

  // Add a new email to the database
  const addEmail = async () => {
    if (!newEmail.trim()) return alert("Email cannot be empty.");

    const response = await fetch("/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail.trim() }),
    });

    if (response.ok) {
      const data = await response.json();
      setAllowedEmails(data.allowedEmails);
      setNewEmail(""); // Clear the input field
    } else {
      alert("Failed to add email.");
      console.error("Failed to add email");
    }
  };

  // Remove an email from the database
  const removeEmail = async (email) => {
    const response = await fetch("/api/emails", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const data = await response.json();
      setAllowedEmails(data.allowedEmails);
    } else {
      alert("Failed to remove email.");
      console.error("Failed to remove email");
    }
  };

  return (
    <div className="min-h-screen flex flex-col py-6 items-center justify-start bg-gray-100">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">
        Flexible Database System
      </h1>

      {/* User Guide Dropdown */}
      <div className="mt-2 mb-6 px-4">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-fit bg-blue-700 text-white px-4 py-2 rounded text-center"
        >
          {showGuide ? "Hide User Guide ▴" : "User Guide ▾"}
        </button>
        {showGuide && (
          <div className="mt-2 bg-white shadow-lg rounded p-4">
            <h2 className="text-lg font-semibold mb-4">
              How to Use the System
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Sign In:</strong> Use your Google account to sign in
                securely.
              </li>
              <li>
                <strong>Database Records:</strong> Navigate to the Database
                Records page to view, add, edit, and delete customer records.
              </li>
              <li>
                <strong>Database Design:</strong> Use the Database Design page
                to add, edit, or delete fields dynamically.
              </li>
              <li>
                <strong>Fast Search:</strong> Use the search bar on the Database
                Records page to quickly find specific data.
              </li>
            </ul>
          </div>
        )}
      </div>

      {session ? (
        <>
          <p>Welcome, {session.user.name}!</p>
          {/* Admin-Only Email Management Section */}
          {session.user.email === adminEmail && (
            <div className="mt-6 w-full max-w-md p-4 bg-white shadow-md rounded">
              <h2 className="text-lg font-bold mb-2">Manage Allowed Emails</h2>
              <ul className="mb-4">
                {allowedEmails.map((email) => (
                  <li
                    key={email}
                    className="flex justify-between items-center mb-2"
                  >
                    <span>{email}</span>
                    {email !== adminEmail && (
                      <button
                        onClick={() => removeEmail(email)}
                        className="text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <input
                type="email"
                placeholder="Enter email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
              <button
                onClick={addEmail}
                className="bg-green-500 text-white px-4 py-2 rounded w-full"
              >
                Add Email
              </button>
            </div>
          )}

          <div className="mt-4 space-x-4">
            <Link href="/customers">
              <button className="px-4 py-2 bg-green-700 text-white rounded">
                Database Records
              </button>
            </Link>
            <Link href="/fields">
              <button className="px-4 py-2 bg-slate-900 text-white rounded">
                Database Design
              </button>
            </Link>
          </div>

          <button
            onClick={() => signOut()}
            className="mt-4 px-4 py-2 bg-red-700 text-white rounded"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign In with Google
        </button>
      )}
    </div>
  );
}
