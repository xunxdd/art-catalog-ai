import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import type { Express } from "express";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupLocalAuth(app: Express) {
  // Passport session serialization
  passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
  });
  
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      cb(null, user);
    } catch (error) {
      cb(error);
    }
  });
  // Email/Password Strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !user.password) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        
        if (!user) {
          // Create new user from Google profile
          user = await storage.upsertUser({
            id: `google_${profile.id}`,
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profileImageUrl: profile.photos?.[0]?.value || '',
            provider: 'google',
            role: 'user',
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // Facebook Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ['id', 'emails', 'name', 'picture.type(large)']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        
        if (!user) {
          // Create new user from Facebook profile
          user = await storage.upsertUser({
            id: `facebook_${profile.id}`,
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profileImageUrl: profile.photos?.[0]?.value || '',
            provider: 'facebook',
            role: 'user',
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // Authentication routes
  
  // Email/Password Registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const user = await storage.upsertUser({
        id: `email_${Date.now()}`,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        provider: 'email',
        role: 'user',
      });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Registration failed" });
        res.status(201).json({ user: { ...user, password: undefined } });
      });
    } catch (error) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Email/Password Login
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        res.json({ user: { ...user, password: undefined } });
      });
    })(req, res, next);
  });

  // Google OAuth routes
  app.get("/api/auth/google", 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  // Facebook OAuth routes
  app.get("/api/auth/facebook",
    passport.authenticate('facebook', { scope: ['email'] })
  );

  app.get("/api/auth/facebook/callback",
    passport.authenticate('facebook', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  });
}