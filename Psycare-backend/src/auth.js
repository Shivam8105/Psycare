import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        // Default funny name and avatar for Google users
        const DEFAULT_FUNNY_NAME = "Jugaadu";
        const DEFAULT_AVATAR = "😉";

        // Always assign 'student' as default role for Google login
        const role = 'student';
        if (!user) {
          user = await User.create({
            name: profile.displayName || 'Unnamed User',
            email,
            password: '', // not needed for Google users
            role,
            funnyName: DEFAULT_FUNNY_NAME,
            avatar: DEFAULT_AVATAR
          });
          return done(null, user);
        } else {
          let needsUpdate = false;
          if (!user.funnyName) {
            user.funnyName = DEFAULT_FUNNY_NAME;
            needsUpdate = true;
          }
          if (!user.avatar) {
            user.avatar = DEFAULT_AVATAR;
            needsUpdate = true;
          }
          if (!user.role) {
            user.role = role;
            needsUpdate = true;
          }
          if (needsUpdate) {
            await user.save();
          }
          return done(null, user);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id); // store user id, safer than email
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password'); // exclude password
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
