"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // To toggle the dropdown
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch customers and fields
  useEffect(() => {
    fetchFields();
    fetchCustomers();
  }, []);

  const fetchFields = async () => {
    const response = await fetch("/api/fields", { method: "GET" });
    const data = await response.json();
    setFields(data);
  };

  const fetchCustomers = async () => {
    const response = await fetch("/api/customers", { method: "GET" });
    const data = await response.json();
    setCustomers(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      await fetchCustomers();
      setFormData({});
      setDropdownOpen(false); // Close dropdown after adding
    } else {
      console.error("Failed to add customer");
    }
  };

  const updateCustomer = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingCustomer._id, ...formData }),
    });

    if (response.ok) {
      await fetchCustomers();
      setEditingCustomer(null);
      setFormData({});
      setDropdownOpen(false); // Close dropdown after updating
    } else {
      console.error("Failed to update customer");
    }
  };

  const deleteCustomer = async (id) => {
    const response = await fetch("/api/customers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      await fetchCustomers();
    } else {
      console.error("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    fields.some((field) =>
      customer[field.name]
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <Link
        href="/"
        className="bg-black px-2 py-1 rounded-md mt-4 text-sm align-self text-white hover:underline"
      >
        Back
      </Link>
      <Link
        href="/fields"
        className="bg-black px-2 py-1 ml-8 rounded-md mt-4 text-sm align-self text-white hover:underline"
      >
        Go To Database Design
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-6">Database Records</h1>

      {/* Fast Search */}
      <input
        type="text"
        placeholder="Search records..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {/* Toggleable Dropdown for Add/Edit Form */}
      <div className="mb-6">
        <button
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            setEditingCustomer(null);
            setFormData({});
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {dropdownOpen ? "Close Form ▴" : "New Record ▾"}
        </button>
        {dropdownOpen && (
          <div className="mt-4 bg-white shadow-lg rounded p-4">
            <h2 className="text-xl font-semibold mb-4">
              {editingCustomer ? "Edit Record" : "Add New Record"}
            </h2>
            <form onSubmit={editingCustomer ? updateCustomer : addCustomer}>
              {fields.map((field) => (
                <div key={field._id} className="mb-4">
                  <label className="block text-gray-700">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleInputChange}
                      className="border p-2 rounded w-full"
                      required
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleInputChange}
                      className="border p-2 rounded w-full"
                      rows="4"
                      required
                    ></textarea>
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleInputChange}
                      className="border p-2 rounded w-full"
                      required
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded mr-4"
              >
                {editingCustomer ? "Update Record" : "Add Record"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  setEditingCustomer(null);
                  setFormData({});
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Responsive Customer Table */}
      <h2 className="text-xl font-semibold mb-4">Records</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded shadow">
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field._id} className="border p-2 text-left">
                  {field.label}
                </th>
              ))}
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer._id}>
                {fields.map((field) => (
                  <td key={field._id} className="border p-2">
                    {field.type === "date"
                      ? formatDate(customer[field.name])
                      : customer[field.name] || ""}
                  </td>
                ))}
                <td className="border p-2">
                  <div className="grid columns-1 gap-4">
                    <button
                      onClick={() => {
                        setEditingCustomer(customer);
                        setFormData(customer); // Pre-fill form data
                        setDropdownOpen(true); // Open dropdown for editing
                      }}
                      className=""
                    >
                      ✍️
                    </button>
                    <button
                      onClick={() => deleteCustomer(customer._id)}
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
    </div>
  );
}
