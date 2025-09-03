import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic API endpoints
app.post('/tasks', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Task creation endpoint', data: { taskId: 'mock-task-id' } });
});

app.get('/tasks', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Tasks retrieval endpoint', data: [] });
});

app.post('/apply', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Application endpoint', data: { applicationId: 'mock-app-id' } });
});

app.post('/proofs', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Proof submission endpoint', data: { proofId: 'mock-proof-id' } });
});

app.post('/match', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Matching endpoint', data: { matchId: 'mock-match-id' } });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { message: 'Endpoint not found' } });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;