import {
  CHAT_MESSAGE_SEND,
  CHAT_MESSAGES_SUBSCRIBE,
  CHAT_MESSAGES_UNSUBSCRIBE,
  CHAT_ADD_MESSAGE_CLASS,
} from "./types/chat";

export const sendChatMessage = (payload) => ({
  type: CHAT_MESSAGE_SEND,
  payload,
});

export const subscribeOnChatMessages = () => ({
  type: CHAT_MESSAGES_SUBSCRIBE,
});

export const unsubscribeFromChatMessages = () => ({
  type: CHAT_MESSAGES_UNSUBSCRIBE,
});

/**
 * @param {String} payload ex: MSGCLASS_HUNTER
 */
export const addMessageClass = (payload) => ({
  type: CHAT_ADD_MESSAGE_CLASS,
  payload,
});
