import { prisma } from './prisma';
import { logger } from './logger';
import { sanitizeInput, sanitizeOutput } from './sanitize';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * Load conversation history from the database
 */
export async function getConversationHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const session = await prisma.patientSession.findUnique({
      where: { id: sessionId },
      select: { conversationLog: true }
    });

    if (!session?.conversationLog) return [];

    return JSON.parse(session.conversationLog);
  } catch (error) {
    logger.warn('Failed to load conversation history', { sessionId, error });
    return [];
  }
}

/**
 * Save new messages to the conversation history
 */
export async function saveConversationMessage(
  sessionId: string,
  userMessage: string,
  aiResponse: string,
  language: string
): Promise<void> {
  try {
    const history = await getConversationHistory(sessionId);
    const updatedHistory = [
      ...history,
      { role: 'user', content: sanitizeInput(userMessage) },
      { role: 'model', content: sanitizeOutput(aiResponse) }
    ];

    await prisma.patientSession.upsert({
      where: { id: sessionId },
      update: {
        conversationLog: JSON.stringify(updatedHistory),
        updatedAt: new Date(),
      },
      create: {
        id: sessionId,
        conversationLog: JSON.stringify(updatedHistory),
        language: language,
        status: 'IN_PROGRESS',
        consentGiven: true,
        consentTimestamp: new Date(),
      }
    });
  } catch (error) {
    logger.error('Failed to save conversation message', error, { sessionId });
    throw new Error('Database persistence failed');
  }
}
