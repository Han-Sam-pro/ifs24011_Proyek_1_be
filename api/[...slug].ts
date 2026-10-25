// Entry point Vercel (serverless). Semua request ke /api/* diteruskan ke aplikasi Express.
import { createExpressApp } from '../server/app.js';

export default createExpressApp();
