import { createExpressApp } from './app';

// Entry point backend RoamPlan (API saja, tidak menyajikan frontend).
const PORT = Number(process.env.PORT) || 3001;
const app = createExpressApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RoamPlan API berjalan di http://0.0.0.0:${PORT}/api`);
});
