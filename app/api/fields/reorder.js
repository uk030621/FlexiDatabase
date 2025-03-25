import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("flexibledbtrial"); // Ensure the correct database
    const collection = db.collection("fields");

    const newOrder = await req.json();

    // Loop through each field and update its order in MongoDB
    for (const field of newOrder) {
      await collection.updateOne(
        { _id: field._id },
        { $set: { order: field.order } }
      );
    }

    // Fetch updated fields sorted by order
    const updatedFields = await collection
      .find({})
      .sort({ order: 1 })
      .toArray();

    return new Response(JSON.stringify(updatedFields), { status: 200 });
  } catch (error) {
    console.error("Error reordering fields:", error);
    return new Response(JSON.stringify({ error: "Failed to reorder fields" }), {
      status: 500,
    });
  }
}
