import { createApp } from './app.js';
import { config } from './config.js';
import { openDatabase } from './db.js';

const db = await openDatabase();
const app = createApp({ db });
const server = app.listen(config.port, () => {
  console.log(`[API] RoamPlan backend berjalan di http://localhost:${config.port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
