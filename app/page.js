"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [showGuide, setShowGuide] = useState(false); // State to toggle the guide dropdown

  return (
    <div className="min-h-screen flex flex-col py-6 items-center justify-start bg-gray-100">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">
        Dynamic Database System
      </h1>

      {/* Guide Dropdown */}
      <div className="mt-2 mb-6 px-4 ">
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
                <strong>Database Records:</strong> Navigate to the
                `&quot;`Database Records`&quot;` page to view, add, edit, and
                delete customer records.
              </li>
              <li>
                <strong>Database Design:</strong> Use the `&quot;`Database
                Design`&quot;` page to add, edit, or delete fields (e.g., Name,
                Email, Phone). These fields dynamically update the customer
                schema.
              </li>
              <li>
                <strong>Fast Search:</strong> Use the search bar on the
                `&quot;`Database Records`&quot;` page to quickly find specific
                data across all fields.
              </li>
              <li>
                <strong>Responsive Design:</strong> The interface is optimized
                for devices of all sizes, from mobile to desktop.
              </li>
            </ul>
          </div>
        )}
      </div>

      {session ? (
        <>
          <p>Welcome, {session.user.name}!</p>
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
