//app/fields/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Fields() {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "text",
    options: [],
  });
  const [editingField, setEditingField] = useState(null);

  // Fetch all fields on initial render
  useEffect(() => {
    fetchFields();
  }, []);

  // Automatically generate a unique Field Name when adding a new field
  useEffect(() => {
    if (!editingField) {
      setNewField((prev) => ({
        ...prev,
        name: generateUniqueCode(), // Generate a unique Field Name
      }));
    }
  }, [editingField]);

  // Fetch existing fields from the server
  const fetchFields = async () => {
    const response = await fetch("/api/fields", { method: "GET" });
    const data = await response.json();
    setFields(data);
  };

  // Function to generate a unique Field Name
  const generateUniqueCode = () => {
    return `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

  // Handle adding a new field
  const addField = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newField),
    });

    if (response.ok) {
      await fetchFields();
      setNewField({
        name: generateUniqueCode(),
        label: "",
        type: "text",
        options: [],
      });
    } else {
      console.error("Failed to add field");
    }
  };

  // Handle updating an existing field
  const updateField = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/fields", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingField._id, ...editingField }),
    });

    if (response.ok) {
      await fetchFields();
      setEditingField(null);
    } else {
      console.error("Failed to update field");
    }
  };

  // Handle deleting a field
  const deleteField = async (id, name) => {
    const response = await fetch("/api/fields", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });

    if (response.ok) {
      await fetchFields();
    } else {
      console.error("Failed to delete field");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-300">
      {/* Navigation Links */}
      <Link
        href="/"
        className="bg-slate-800 hover:bg-slate-600 px-2 py-1 rounded-md mt-4 text-sm align-self text-white"
      >
        Back
      </Link>
      <Link
        href="/customers"
        className="bg-slate-800 hover:bg-slate-600 px-2 py-1 ml-8 rounded-md mt-4 text-sm align-self text-white"
      >
        Go To Database Records
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-6">Database Design</h1>

      {/* Add New Field Form */}
      {!editingField && (
        <form onSubmit={addField} className="mb-6">
          <h2 className="text-xl font-semibold ">Add New Label</h2>

          {/* Field Label Input */}
          <input
            type="text"
            placeholder="Label"
            value={newField.label}
            onChange={(e) =>
              setNewField({ ...newField, label: e.target.value })
            }
            className="bg-white border p-2 rounded mr-2 mb-2"
            required
          />

          {/* Field Type Selection */}
          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            className="bg-white border p-2 rounded mr-2"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="date">Date</option>
            <option value="textarea">Long Text</option>
            <option value="select">Dropdown</option>
            <option value="url">URL</option> {/* 👈 Added URL option */}
          </select>

          {/* Input for Dropdown Options */}
          {newField.type === "select" && (
            <div>
              <input
                type="text"
                placeholder="Comma-separated options"
                value={newField.options.join(", ")}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    options: e.target.value.split(",").map((opt) => opt.trim()),
                  })
                }
                className="border p-2 rounded w-full mt-2"
              />
            </div>
          )}

          {/* Input for URL */}
          {newField.type === "url" && (
            <div className="hidden">
              <input
                type="text"
                placeholder="Enter A Test URL"
                value={newField.value || "Dummy"}
                onChange={(e) =>
                  setNewField({ ...newField, value: e.target.value })
                }
                className="border p-2 rounded w-full mt-2"
                required
              />
              {/* Display the clickable URL preview */}
              {newField.value && (
                <p className="mt-2">
                  Preview:{" "}
                  <a
                    href={newField.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {newField.value}
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Add Field Button */}
          <button
            type="submit"
            className="bg-blue-800 hover:bg-blue-600 text-white mt-3 px-4 py-2 rounded"
          >
            Add Field
          </button>
        </form>
      )}

      {/* Edit Field Form */}
      {editingField && (
        <form onSubmit={updateField} className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Field</h2>
          <input
            type="text"
            placeholder="Label"
            value={editingField.label}
            onChange={(e) =>
              setEditingField({ ...editingField, label: e.target.value })
            }
            className="border p-2 rounded mr-2 mb-2"
            required
          />
          <select
            value={editingField.type}
            onChange={(e) =>
              setEditingField({ ...editingField, type: e.target.value })
            }
            className="border p-2 rounded mr-2"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="date">Date</option>
            <option value="textarea">Long Text</option>
            <option value="select">Dropdown</option>
            <option value="url">URL</option> {/* 👈 Added URL option */}
          </select>

          {/* Input for Dropdown Options */}
          {editingField.type === "select" && (
            <div>
              <input
                type="text"
                placeholder="Comma-separated options"
                value={editingField.options.join(", ")}
                onChange={(e) =>
                  setEditingField({
                    ...editingField,
                    options: e.target.value.split(",").map((opt) => opt.trim()),
                  })
                }
                className="border p-2 rounded w-full mt-2"
              />
            </div>
          )}

          {/* Input for URL */}
          {editingField.type === "url" && (
            <div className="hidden">
              <input
                type="text"
                placeholder="Enter A Test URL"
                value={editingField.value || "Dummy"}
                onChange={(e) =>
                  setEditingField({ ...editingField, value: e.target.value })
                }
                className="border p-2 rounded w-full mt-2"
                required
              />
              {/* Display the clickable URL preview */}
              {editingField.value && (
                <p className="mt-2">
                  Preview:{" "}
                  <a
                    href={editingField.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {editingField.value}
                  </a>
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="bg-green-800 hover:bg-green-600 text-white px-4 py-2 rounded mr-2 mt-3"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => setEditingField(null)}
            className="bg-slate-800 hover:bg-slate-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Field List */}
      <h2 className="text-xl font-semibold mb-2">Field List</h2>
      <table className="w-full border-collapse bg-white rounded shadow">
        <thead className="bg-slate-200">
          <tr>
            {/* Removed Field Name Column */}
            <th className="border p-2">Label</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field._id}>
              {/* Removed Field Name Cell */}
              <td className="border p-2">{field.label}</td>
              <td className="border p-2">{field.type}</td>
              <td className="border p-2">
                <div className="grid columns-1 gap-4">
                  <button onClick={() => setEditingField(field)} className="">
                    ✍️
                  </button>
                  <button
                    onClick={() => deleteField(field._id, field.name)}
                    className=""
                  >
                    ❌
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
