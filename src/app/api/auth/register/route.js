import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response("User exists", { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashed,
    });

    return new Response("User created", { status: 201 });
  } catch (err) {
    return new Response("Error", { status: 500 });
  }
}
