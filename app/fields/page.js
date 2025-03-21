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

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    const response = await fetch("/api/fields", { method: "GET" });
    const data = await response.json();
    setFields(data);
  };

  const addField = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newField),
    });

    if (response.ok) {
      await fetchFields();
      setNewField({ name: "", label: "", type: "text", options: [] });
    } else {
      console.error("Failed to add field");
    }
  };

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
    <div className="min-h-screen p-8 bg-gray-100">
      <Link
        href="/"
        className="bg-black px-2 py-1 rounded-md mt-4 text-sm align-self text-white hover:underline"
      >
        Back
      </Link>
      <Link
        href="/customers"
        className="bg-black px-2 py-1 ml-8 rounded-md mt-4 text-sm align-self text-white hover:underline"
      >
        Go To Database Records
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-6">Database Design</h1>

      {!editingField && (
        <form onSubmit={addField} className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Field</h2>
          <input
            type="text"
            placeholder="Field Name"
            value={newField.name}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            className="border p-2 rounded mr-2 mb-2"
            required
          />
          <input
            type="text"
            placeholder="Label"
            value={newField.label}
            onChange={(e) =>
              setNewField({ ...newField, label: e.target.value })
            }
            className="border p-2 rounded mr-2 mb-2"
            required
          />
          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            className="border p-2 rounded mr-2"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="date">Date</option>
            <option value="textarea">Long Text</option>
            <option value="select">Dropdown</option>
          </select>
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
          <button
            type="submit"
            className="bg-blue-500 text-white mt-3 px-4 py-2 rounded"
          >
            Add Field
          </button>
        </form>
      )}

      {editingField && (
        <form onSubmit={updateField} className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Field</h2>
          <input
            type="text"
            placeholder="Field Name"
            value={editingField.name}
            onChange={(e) =>
              setEditingField({ ...editingField, name: e.target.value })
            }
            className="border p-2 rounded mr-2 mb-2"
            required
          />
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
          </select>
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
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded mr-2 mt-3"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => setEditingField(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </form>
      )}

      <h2 className="text-xl font-semibold mb-4">Field List</h2>
      <table className="w-full border-collapse bg-white rounded shadow">
        <thead>
          <tr>
            <th className="border p-2">Field Name</th>
            <th className="border p-2">Label</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field._id}>
              <td className="border p-2">{field.name}</td>
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
