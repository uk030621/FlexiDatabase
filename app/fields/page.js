//app/fields/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Fields() {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "text",
    options: [],
  });
  const [editingField, setEditingField] = useState(null);

  // ✨ New: Temporary input values for "select" fields
  const [newFieldTempValue, setNewFieldTempValue] = useState("");
  const [editingFieldTempValue, setEditingFieldTempValue] = useState("");

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

  // Handle drag-and-drop reordering
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedFields = [...fields];
    const [movedItem] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, movedItem);

    setFields(reorderedFields);

    // Optionally update the order in the backend
    await fetch("/api/fields/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reorderedFields),
    });
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      {/* Navigation Links */}
      <Link
        href="/"
        className="bg-blue-800 hover:bg-blue-600 px-2 py-2 rounded-md mt-4 text-sm align-self text-white"
      >
        Back
      </Link>
      <Link
        href="/customers"
        className="bg-blue-800 hover:bg-blue-600 px-2 py-2 ml-8 rounded-md mt-4 text-sm align-self text-white"
      >
        Go To Database Records
      </Link>
      <div className="flex items-center gap-1 mt-4 mb-4">
        <h1 className="text-3xl font-bold mt-4 mb-6">Database Design</h1>
        <Image
          src="/Adb.png" // Replace with your image path
          alt="Database Icon"
          width={40} // Adjust width as needed
          height={40} // Adjust height as needed
          className="bg-transparent"
        />
      </div>
      {/* Add New Field Form */}
      {!editingField && (
        <form onSubmit={addField} className="mb-6">
          <h2 className="mb-1 text-xl font-semibold ">Add New Label</h2>

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
            className="bg-yellow-100 border p-2 rounded mr-2 w-24"
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
                placeholder="Type option and press comma"
                value={newFieldTempValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.endsWith(",")) {
                    const newOption = value.slice(0, -1).trim();
                    if (newOption && !newField.options.includes(newOption)) {
                      setNewField((prev) => ({
                        ...prev,
                        options: [...prev.options, newOption],
                      }));
                    }
                    setNewFieldTempValue("");
                  } else {
                    setNewFieldTempValue(value);
                  }
                }}
                className="bg-white border p-2 rounded w-full mt-2"
              />

              {newField.options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newField.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-sm"
                    >
                      {opt}
                      <button
                        type="button"
                        className="ml-1 text-blue-600 hover:text-red-600"
                        onClick={() => {
                          setNewField((prev) => ({
                            ...prev,
                            options: prev.options.filter((o) => o !== opt),
                          }));
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
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
          <h2 className="mb-1 text-xl font-semibold ">Edit Field</h2>
          <input
            type="text"
            placeholder="Label"
            value={editingField.label}
            onChange={(e) =>
              setEditingField({ ...editingField, label: e.target.value })
            }
            className="bg-white border p-2 rounded mr-2 mb-2"
            required
          />
          <select
            value={editingField.type}
            onChange={(e) =>
              setEditingField({ ...editingField, type: e.target.value })
            }
            className="bg-yellow-100 border p-2 rounded mr-2"
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
                placeholder="Type option and press comma"
                value={editingFieldTempValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.endsWith(",")) {
                    const newOption = value.slice(0, -1).trim();
                    if (
                      newOption &&
                      !editingField.options.includes(newOption)
                    ) {
                      setEditingField((prev) => ({
                        ...prev,
                        options: [...prev.options, newOption],
                      }));
                    }
                    setEditingFieldTempValue("");
                  } else {
                    setEditingFieldTempValue(value);
                  }
                }}
                className="bg-white border p-2 rounded w-full mt-2"
              />

              {editingField.options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingField.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-sm"
                    >
                      {opt}
                      <button
                        type="button"
                        className="ml-1 text-blue-600 hover:text-red-600"
                        onClick={() => {
                          setEditingField((prev) => ({
                            ...prev,
                            options: prev.options.filter((o) => o !== opt),
                          }));
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
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
      <h2 className="text-xl font-semibold mb-2">
        Field List (Drag to Reorder)
      </h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <table
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-full border-collapse bg-white rounded shadow"
            >
              <thead className="bg-slate-200">
                <tr>
                  <th className="border p-2">Label</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <Draggable
                    key={field._id}
                    draggableId={field._id}
                    index={index}
                  >
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="hover:bg-gray-100 cursor-pointer"
                      >
                        <td className="border p-2">{field.label}</td>
                        <td className="border p-2">{field.type}</td>
                        <td className="border p-2">
                          <div className="grid columns-1 gap-4">
                            <button
                              onClick={() => setEditingField(field)}
                              className=""
                            >
                              ✍️
                            </button>
                            <button
                              onClick={() => {
                                const confirmed = window.confirm(
                                  `Are you sure you want to delete the "${field.label}" field? This action cannot be undone.`
                                );
                                if (confirmed) {
                                  deleteField(field._id, field.name);
                                }
                              }}
                              className=""
                            >
                              ❌
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
