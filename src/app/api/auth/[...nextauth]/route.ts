import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "admin@agency.com" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })

                if (user) {
                    // In a real app, verify passwords here!
                    // For MVP, we trust the email exists in DB.
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role, // Pass custom role to session
                    }
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login', // We will build this page later
    },
    secret: "super-secret-for-mvp-only",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
