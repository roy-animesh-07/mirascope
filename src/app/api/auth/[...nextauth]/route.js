import NextAuth from "next-auth";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GooggleProvider from "next-auth/providers/google";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GooggleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        try {
          await connectToDatabase();

          const user = await User.findOne({
            email: credentials?.email,
          });

          if (!user) {
            throw new Error("User not found");
          }

          const isValidPassword = await bcrypt.compare(
            credentials?.password || "",
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "github") {
        await connectToDatabase();

        const existingUser = await User.findOne({
          email: profile?.email,
        });

        if (!existingUser) {
          await User.create({
            name: profile?.name,
            email: profile?.email,
            provider: "github",
          });
        }
      }
      if (account?.provider === "google") {
        await connectToDatabase();
        const existingUser = await User.findOne({
          email: profile?.email,
        });
        if (!existingUser) {
            await User.create({
                name: profile?.name,
                email: profile?.email,
                provider: "google",
            });
        }   
    }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
        };
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };