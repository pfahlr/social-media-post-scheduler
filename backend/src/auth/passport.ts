import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { prisma } from '../db/client';
import type { UserSession } from './types';

export function configurePassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          const match = await bcrypt.compare(password, user.passwordHash);
          if (!match) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          const sessionUser: UserSession = {
            id: user.id,
            email: user.email
          };

          return done(null, sessionUser);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, (user as UserSession).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return done(null, false);
      }
      const sessionUser: UserSession = {
        id: user.id,
        email: user.email
      };
      return done(null, sessionUser);
    } catch (err) {
      return done(err);
    }
  });
}
