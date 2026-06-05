import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Hardcoded admin credentials — replace with DB lookup when Prisma is ready
        if (
          credentials?.email === 'admin@toyota-ma.com' &&
          credentials?.password === 'Admin@2024!'
        ) {
          return { id: '1', email: 'admin@toyota-ma.com', name: 'Admin Toyota' }
        }
        return null
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})
