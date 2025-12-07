import NextAuth from "next-auth";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";

const handler = NextAuth({
  session: {
    strategy: "jwt",
    },
    providers: [

        Github({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password:{},
            },
            async authorize(credentials) {
                try {
                    await connectToDatabase();
                    const user = await User.findOne({ email: credentials?.email });
                    if (!user) {
                        throw new Error("")
                    }
                    const isValidPassword = await bcrypt.compare(
                        credentials?.password ?? "", user.password
                    ); 
                    if (!isValidPassword) {
                        throw new Error ("")
                    }
                    return user;
                }
                catch {
                    return null
                }
            }
        })

    ],
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "github") {
                await connectToDatabase();
                const existingUser = await User.findOne({ email: profile?.email });
                if (!existingUser) {
                    await User.create({
                        name: profile?.name,
                        email: profile?.email,
                        provider: "github",
                    })
                }
            }

            return true;
              },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    email: token.email,
                    name: token.name,
                    image: token.picture,
                };
            };
            return session;
        }
        
    },
    secret: process.env.NEXTAUTH_SECRET
    

  
});
export { handler as GET, handler as POST };