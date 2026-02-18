import { messageControllerCreate } from './generated/server.client';

export type {
  MessageResponse,
  CreateMessageDto,
} from './generated/server.client';

export const createMessage = async (chatId: string, payload: { content: string }) => {
  const res = await messageControllerCreate(chatId, payload);
  return res.data;
};
