import {
  INIT,
  UNINIT,
  INIT_SUCCEEDED,
  INIT_FAILED,
  GENERATE_LOGS,
  GENERATE_LOGS_SUCCEEDED,
  GENERATE_LOGS_FAILED,
  DIACTIVATE_TAB,
} from "../actions/types/app";

const initialState = {
  inited: false,
  initError: false,
  tabIsDisabled: false,
  generatingLogsInProgress: false,
};

const app = (state = initialState, action) => {
  switch (action.type) {
    case INIT:
      return {
        ...state,
        inited: false,
      };

    case UNINIT:
      return {
        ...state,
        inited: false,
      };

    case INIT_SUCCEEDED:
      return {
        ...state,
        inited: true,
      };

    case INIT_FAILED:
      return {
        ...state,
        inited: false,
        initError: true,
      };

    case GENERATE_LOGS:
      return {
        ...state,
        generatingLogsInProgress: true,
      };

    case GENERATE_LOGS_SUCCEEDED:
      return {
        ...state,
        generatingLogsInProgress: false,
      };

    case GENERATE_LOGS_FAILED:
      return {
        ...state,
        generatingLogsInProgress: false,
      };
    case DIACTIVATE_TAB:
      return {
        ...state,
        tabIsDisabled: true,
      };
    default:
      return state;
  }
};

export default app;
