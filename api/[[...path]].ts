import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Serverless Function - API handler
// Routes all /api/* requests to the Express app

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const app = (await import('../backend/src/index.ts')).default;
  return app(req, res);
};

export default handler;

