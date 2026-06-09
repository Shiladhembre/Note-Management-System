/**
 * app.js — Express app factory.
 * All middleware, view engine, security, and routes are wired here.
 */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const csrf = require('csurf');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');
const { attachUser } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const profileRoutes = require('./routes/profileRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

/* ---------- View engine ---------- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'partials/layout');

/* ---------- Core middleware ---------- */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(methodOverride('_method')); // allow PUT/DELETE from forms
app.use(express.static(path.join(__dirname, 'public')));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

/* ---------- Security ---------- */
app.use(
  helmet({
    contentSecurityPolicy: false, // CDN-loaded Tailwind/Alpine — relax CSP for starter
  })
);
app.use(mongoSanitize());
app.use(xss());
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true })
);
app.use(
  '/auth',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true })
);

/* ---------- Sessions + flash ---------- */
app.use(
  session({
    name: 'sn.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);
app.use(flash());

/* ---------- CSRF (skip for JSON API) ---------- */
const csrfProtection = csrf();
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return csrfProtection(req, res, next);
});

/* ---------- Locals for views ---------- */
app.use(attachUser); // sets req.user + res.locals.user from session/JWT
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
});

/* ---------- Routes ---------- */
app.get('/', (req, res) => res.redirect(req.user ? '/notes' : '/auth/login'));
app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);
app.use('/profile', profileRoutes);
app.use('/api', apiRoutes);

/* ---------- 404 + error ---------- */
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));
app.use(errorHandler);

module.exports = app;
