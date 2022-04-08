import {
  CHAT_LEAVE_SUCCEEDED,
  CHAT_MESSAGE_RECIEVED,
  CHAT_MESSAGE_SEND_SUCCEEDED,
  CHAT_SPECIAL_MESSAGE_RECIEVED,
} from "../actions/types/chat";

const initialState = {
  history: [],
  specialMessage: null,
};

const chat = (state = initialState, action) => {
  switch (action.type) {
    case CHAT_MESSAGE_SEND_SUCCEEDED:
      return {
        ...state,
        history: [...state.history, action.payload],
      };

    case CHAT_MESSAGE_RECIEVED:
      return {
        ...state,
        history: [...state.history, action.payload],
      };

    case CHAT_LEAVE_SUCCEEDED:
      return {
        ...state,
        history: [],
      };

    case CHAT_SPECIAL_MESSAGE_RECIEVED:
      return {
        ...state,
        specialMessage: action.payload,
      };

    default:
      return state;
  }
};

export default chat;
