import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail ou Telefone', type: 'text' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[auth] Sem credenciais');
          return null;
        }

        const result = await query(
          `SELECT id, nome, email, telefone, hash_senha, papel 
           FROM utilizadores 
           WHERE email = $1 OR telefone = $1`,
          [credentials.email]
        );

        if (result.rows.length === 0) {
          console.log('[auth] Utilizador não encontrado:', credentials.email);
          return null;
        }

        const user = result.rows[0];
        console.log('[auth] Utilizador encontrado:', user.email);

        const senhaValida = await bcrypt.compare(credentials.password, user.hash_senha);
        if (!senhaValida) {
          console.log('[auth] Senha inválida para:', user.email);
          return null;
        }

        console.log('[auth] Login bem-sucedido:', user.email);

        return {
          id: user.id.toString(),
          name: user.nome,
          email: user.email,
          role: user.papel,
          telefone: user.telefone,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.telefone = user.telefone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.telefone = token.telefone as string;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.JWT_SECRET,
  debug: process.env.NODE_ENV !== 'production', // desliga em produção
};