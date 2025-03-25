import clientPromise from "@/lib/mongodb";

export async function GET(_req) {
  try {
    const client = await clientPromise;
    const db = client.db("flexibledbtrial"); // Ensure the correct database
    const collection = db.collection("fields");

    // Fetch fields sorted by 'order'
    const fields = await collection.find({}).sort({ order: 1 }).toArray();

    return new Response(JSON.stringify(fields), { status: 200 });
  } catch (error) {
    console.error("Error fetching fields:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch fields" }), {
      status: 500,
    });
  }
}
