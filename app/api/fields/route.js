import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const DB_NAME = "flexibledbtrial";
const FIELDCOLLECTION_NAME = "fields";
const CUSTOMER_COLLECTION_NAME = "customers";

// Get all fields
export async function GET(_req) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const fields = await db.collection(FIELDCOLLECTION_NAME).find({}).toArray();
  return new Response(JSON.stringify(fields), { status: 200 });
}

// Add a new field
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const newField = await req.json();

  try {
    // Add new field to the fields collection
    await db.collection(FIELDCOLLECTION_NAME).insertOne(newField);

    // Add the new field to all existing customers with a default value
    const defaultValue = null; // Default value for the new field
    await db
      .collection(CUSTOMER_COLLECTION_NAME)
      .updateMany({}, { $set: { [newField.name]: defaultValue } });

    return new Response(
      JSON.stringify({ message: "Field added successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding field:", error);
    return new Response(JSON.stringify({ error: "Failed to add field" }), {
      status: 500,
    });
  }
}

// Update an existing field
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const { id, _id, ...updatedField } = await req.json(); // Exclude `_id`

  try {
    // Update the field in the fields collection
    const result = await db
      .collection(FIELDCOLLECTION_NAME)
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedField });

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "Field not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Field updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating field:", error);
    return new Response(JSON.stringify({ error: "Failed to update field" }), {
      status: 500,
    });
  }
}

// Delete a field
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const { id, name } = await req.json(); // Ensure `name` is also passed

  try {
    // Remove the field from the fields collection
    const result = await db
      .collection(FIELDCOLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "Field not found" }), {
        status: 404,
      });
    }

    // Remove the field from all existing customers
    await db
      .collection(CUSTOMER_COLLECTION_NAME)
      .updateMany({}, { $unset: { [name]: "" } });

    return new Response(
      JSON.stringify({ message: "Field deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting field:", error);
    return new Response(JSON.stringify({ error: "Failed to delete field" }), {
      status: 500,
    });
  }
}
