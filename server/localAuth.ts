import passport from "passport";
import session from "express-session";
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
  // Setup session middleware
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: sessionTtl,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

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
        console.log('LocalStrategy: Looking up user with email:', email);
        const user = await storage.getUserByEmail(email);
        
        if (!user) {
          console.log('LocalStrategy: No user found with email:', email);
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        if (!user.password) {
          console.log('LocalStrategy: User found but no password stored:', email);
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        console.log('LocalStrategy: User found, checking password...');
        const isValid = await comparePasswords(password, user.password);
        console.log('LocalStrategy: Password valid:', isValid);
        
        if (!isValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        console.log('LocalStrategy: Authentication successful for:', email);
        return done(null, user);
      } catch (error) {
        console.error('LocalStrategy error:', error);
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
      console.log('Registration attempt for email:', email);
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const userData = {
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        username: email.split('@')[0], // Use email prefix as username
        firstName: firstName || null,
        lastName: lastName || null,
        password: hashedPassword,
        provider: 'email'
      };
      
      console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });
      const user = await storage.upsertUser(userData);
      console.log('User created successfully:', { id: user.id, email: user.email });

      req.login(user, (err) => {
        if (err) {
          console.error('Login after registration failed:', err);
          if (!res.headersSent) {
            return res.status(500).json({ message: "Registration successful but login failed" });
          }
          return;
        }
        console.log('User logged in after registration');
        if (!res.headersSent) {
          res.status(201).json({ user: { ...user, password: undefined } });
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Registration failed: " + (error as Error).message });
      }
    }
  });

  // Email/Password Login
  app.post("/api/auth/login", (req, res, next) => {
    console.log('Login attempt for email:', req.body.email);
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Login authentication error:', err);
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        console.log('Login failed for email:', req.body.email, 'Info:', info?.message);
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }

      req.login(user, (loginErr: any) => {
        if (loginErr) {
          console.error('Session login error:', loginErr);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log('User logged in successfully:', user.id);
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
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.redirect('/');
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  });
}