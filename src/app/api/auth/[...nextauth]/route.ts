import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";


const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Puedes agregar más providers aquí
  ],
  // Puedes agregar más opciones de NextAuth aquí
});

export { handler as GET, handler as POST }; 