import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const DB_NAME = "flexibledbtrial";
const FIELDCOLLECTION_NAME = "fields";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const updatedFields = await req.json();

  try {
    // Replace existing fields with reordered fields
    await db.collection(FIELDCOLLECTION_NAME).deleteMany({});
    await db.collection(FIELDCOLLECTION_NAME).insertMany(updatedFields);

    return new Response(
      JSON.stringify({ message: "Fields reordered successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reordering fields:", error);
    return new Response(JSON.stringify({ error: "Failed to reorder fields" }), {
      status: 500,
    });
  }
}
