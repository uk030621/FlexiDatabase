"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const [showGuide, setShowGuide] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

  useEffect(() => {
    if (session?.user.email === adminEmail) {
      fetch("/api/emails")
        .then((res) => res.json())
        .then((data) => setAllowedEmails(data.allowedEmails))
        .catch((err) => console.error("Failed to fetch allowed emails:", err));
    }
  }, [session, adminEmail]);

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
      setNewEmail("");
    } else {
      alert("Failed to add email.");
    }
  };

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
    }
  };

  return (
    <div className="min-h-screen flex flex-col py-6 items-center justify-start bg-background">
      <h1 className="text-slate-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">
        Adaptable Database System
      </h1>
      <Image
        src="/Adb.png" // Replace with your image path
        alt="Database Icon"
        width={150} // Adjust width as needed
        height={150} // Adjust height as needed
        className="bg-transparent mb-4 mt-4"
      />
      <div className="mt-2 mb-6 px-4">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-fit text-sm bg-slate-900 hover:bg-slate-600 text-white px-14 py-2 rounded text-center"
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
                <strong>Database Records:</strong> Navigate to view, add, edit,
                and delete records.
              </li>
              <li>
                <strong>Database Design:</strong> Modify fields dynamically.
              </li>
              <li>
                <strong>Fast Search:</strong> Quickly find data using the search
                bar.
              </li>
            </ul>
          </div>
        )}
      </div>

      {status === "loading" ? (
        <p>Loading...</p>
      ) : session ? (
        <>
          <p>Welcome, {session.user.name}!</p>
          {session.user.email === adminEmail && (
            <div className="mt-6 w-fit max-w-md p-6 bg-yellow-100 border-2 shadow-md rounded">
              <h2 className="text-lg font-bold mb-2">
                Admin - Manage Allowed Emails
              </h2>
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
                className="bg-white border p-2 rounded w-full mb-2"
              />
              <button
                onClick={addEmail}
                className="bg-green-800 hover:bg-green-600 text-sm text-white px-4 py-2 rounded w-full"
              >
                Add Email
              </button>
            </div>
          )}
          <div className="mt-4 space-x-4">
            <Link href="/fields">
              <button className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-500 text-white rounded">
                Design
              </button>
            </Link>
            <Link href="/customers">
              <button className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-500 text-white rounded">
                Records
              </button>
            </Link>
          </div>
          <button
            onClick={() => signOut()}
            className="text-sm mt-4 px-4 py-2 bg-red-700 hover:bg-red-500 text-white rounded"
          >
            Sign Out
          </button>
        </>
      ) : (
        <div className="grid columns-1">
          <button
            onClick={() => signIn("google")}
            className="text-lg px-4 py-2 bg-blue-700 hover:bg-blue-500 text-white rounded flex items-center justify-center"
          >
            <Image
              src="/G.png" // Replace with the path to your Google logo
              alt="Google logo"
              width={30} // Set the width of the image
              height={30} // Set the height of the image
              className="rounded-md mr-2"
            />
            Sign In with Google
          </button>

          {/* Friendly Link to Create a Google Account */}
          <p className="mt-2 text-sm text-gray-600">
            Do not have a Google account?{" "}
            <Link
              href="https://support.google.com/accounts/answer/27441?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Create one here
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
