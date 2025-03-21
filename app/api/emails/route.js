import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "flexibledbtrial";
const ALLOWED_EMAIL_COLLECTION_NAME = "allowedEmails";

export async function GET() {
  const client = await clientPromise;
  const db = client.db(DB_NAME); // Replace with your database name
  const allowedEmails = await db
    .collection(ALLOWED_EMAIL_COLLECTION_NAME)
    .find({})
    .toArray();
  return new Response(
    JSON.stringify({
      allowedEmails: allowedEmails.map((email) => email.email),
    }),
    { status: 200 }
  );
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL; // Admin email from .env.local

  console.log("Session Email:", session?.user?.email); // Debug: Log the user's email
  console.log("Admin Email:", adminEmail); // Debug: Log the admin email

  if (!session || session.user.email !== adminEmail) {
    console.log("Unauthorized access attempt"); // Debug: Log unauthorized access
    return new Response("Unauthorized", { status: 401 });
  }

  const { email } = await req.json();
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const existingEmail = await db
    .collection(ALLOWED_EMAIL_COLLECTION_NAME)
    .findOne({ email });
  if (!existingEmail) {
    await db.collection(ALLOWED_EMAIL_COLLECTION_NAME).insertOne({ email });
    console.log(`Email added: ${email}`);
  }

  const updatedEmails = await db
    .collection(ALLOWED_EMAIL_COLLECTION_NAME)
    .find({})
    .toArray();
  return new Response(
    JSON.stringify({
      message: "Email added successfully",
      allowedEmails: updatedEmails.map((email) => email.email),
    }),
    { status: 200 }
  );
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const { email } = await req.json();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!session || session.user.email !== adminEmail) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (email !== adminEmail) {
    await db.collection(ALLOWED_EMAIL_COLLECTION_NAME).deleteOne({ email });
    console.log(`Email removed: ${email}`);
  }

  const updatedEmails = await db
    .collection(ALLOWED_EMAIL_COLLECTION_NAME)
    .find({})
    .toArray();
  return new Response(
    JSON.stringify({
      message: "Email removed successfully",
      allowedEmails: updatedEmails.map((email) => email.email),
    }),
    { status: 200 }
  );
}
