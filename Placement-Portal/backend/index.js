const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config(); // Fallback to local if exists
require('express-async-errors');

const { createServer } = require('http');
const express = require('express');
const cors = require('cors');

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const fileUpload = require('express-fileupload');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// database
const connectDB = require('./db/connect');

// middlewares
const {
  authenticateUser,
  authorizeRoles,
} = require('./middleware/authentication-middleware');
const notFoundHandler = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// routes
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const courseRouter = require('./routes/courseRoutes');
const noticeRouter = require('./routes/noticeRoutes');
const adminRouter = require('./routes/adminRoutes');
const companyRouter = require('./routes/companyRoutes');
const aiResumeRouter = require('./routes/aiResumeRoutes');
const { viewDocument } = require('./controllers/documentController');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl) 
    // or if the origin is in our allowed list
    if (!origin || allowedOrigins.some(ao => origin.startsWith(ao))) {
      callback(null, true);
    } else {
      console.error(`CORS Blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser(process.env.JWT_SECRET));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://res.cloudinary.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // stricter limit for login/register
  message: 'Too many login attempts, please try again after 15 minutes',
});

app.use('/api', limiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

app.use(express.json());
app.use(xss());
app.use(mongoSanitize());

app.use(fileUpload({ useTempFiles: true }));
app.use(express.static('./public'));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', [authenticateUser, userRouter]);
app.use('/api/v1/student', [
  authenticateUser,
  authorizeRoles('student'),
  studentRoutes,
]);
app.use('/api/v1/student', [
  authenticateUser,
  authorizeRoles('student'),
  resumeRoutes,
]);
app.use('/api/v1/courses', [authenticateUser, courseRouter]);
app.use('/api/v1/notice', [authenticateUser, noticeRouter]);
app.use('/api/v1/admin', [
  authenticateUser,
  authorizeRoles('admin'),
  adminRouter,
]);

app.use('/api/v1/company', [authenticateUser, companyRouter]);

// AI Resume Analyzer (independent module — student auth required)
app.use('/api/v1/ai-resume', [
  authenticateUser,
  authorizeRoles('student'),
  aiResumeRouter,
]);

app.get('/api/v1/document/view', authenticateUser, viewDocument);

app.use(notFoundHandler);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    httpServer.listen(PORT, () =>
      console.log(`Server is listening on PORT ${PORT} 🚀`)
    );
  } catch (error) {
    console.log('Connection Failed!', error);
  }
};

start();
