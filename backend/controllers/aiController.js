import {answerFitness,AIServiceError} from '../services/aiService.js';

const replies = {
  BAD_REQUEST:'Please enter a message between 1 and 2000 characters.',
  NOT_CONFIGURED:'AI service/API is unavailable because it is not configured yet. You can still use the workout, nutrition and BMR tools.',
  API_CONFIGURATION:'The AI service/API needs a configuration update. Please use the workout and calculator tools meanwhile.',
  API_RATE_LIMITED:'The AI service/API is at its usage limit. Please try again shortly; the other fitness tools remain available.',
  BUSY:'The AI service is helping several people. Please try again in a few seconds.',
  BLOCKED:'I couldn’t answer that request. Try a question about general fitness or using Shape Up.',
  API_TIMEOUT:'The AI service/API took too long to respond. Please try again; your other fitness tools remain available.',
};
export async function chatWithAI(req,res) {
  const ac = new AbortController();
  const stop = () => ac.abort();
  req.once('aborted',stop);res.once('close',stop);
  res.set('Cache-Control','no-store');
  try {
    const value = await answerFitness({...req.body,signal:ac.signal});
    if (!ac.signal.aborted) res.json(value);
  } catch (error) {
    if (ac.signal.aborted || error?.code === 'CANCELLED') return;
    const known = error instanceof AIServiceError;
    const code = known ? error.code : 'API_UNAVAILABLE';
    if (known && error.retryAfter) res.set('Retry-After',String(error.retryAfter));
    res.status(known?error.status:503).json({code,reply:replies[code] || 'The AI service/API is temporarily unavailable. Please try again shortly; the workout and calculator tools remain available.'});
  } finally {req.removeListener('aborted',stop);res.removeListener('close',stop);}
}
