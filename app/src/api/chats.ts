import {
  chatControllerCreate,
  chatControllerFindAll,
  chatControllerFindById,
  chatControllerRemove,
} from './generated/server.client';

export type {
  ChatResponse,
  ChatWithMessages,
} from './generated/server.client';

export const fetchAllChats = async () => {
  const res = await chatControllerFindAll();
  return res.data;
};

export const fetchChatById = async (id: string) => {
  const res = await chatControllerFindById(id);
  return res.data;
};

export const createChat = async () => {
  const res = await chatControllerCreate();
  return res.data;
};

export const removeChat = async (id: string) => {
  const res = await chatControllerRemove(id);
  return res.data;
};
