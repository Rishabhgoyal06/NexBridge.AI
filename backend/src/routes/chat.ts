import { Router } from 'express';
import { chatService } from '../services/chatService.js';

export const chatRouter = Router();

// POST /api/chat — global context-aware chatbot
chatRouter.post('/', async (req, res) => {
  const { message, context, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await chatService.processMessage({
      message,
      context: context || { pageKey: 'global', title: 'NexBridge', summary: 'Startup platform' },
      history: history || []
    });
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
