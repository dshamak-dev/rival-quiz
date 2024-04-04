import { useCallback, useEffect, useReducer } from "react";
import { useAppContext } from "src/app/context";
import { GET } from "src/support/request.utils";

const initialState = {
  loading: false,
  visible: false,
  data: null,
  error: null,
};

export const useSessionForm = ({} = {}) => {
  const { dispatch } = useAppContext();
  const [payload, dispatchAction] = useReducer(reducer, initialState);

  const show = useCallback((payload = null) => {
    dispatch((state) => {
      return { ...state, sessionFormVisible: true, targetSession: payload };
    });
  }, [dispatch]);

  const hide = useCallback(() => {
    dispatch((state) => {
      return { ...state, sessionFormVisible: false };
    });
  }, [dispatch]);

  return { show, hide };
};

type ActionType = {
  type: "loading" | "visibility" | "data" | "error";
  payload: boolean | string | object;
};

function reducer(state, { type, payload }: ActionType) {
  switch (type) {
    case "visibility": {
      state.visible = payload;

      if (!payload) {
        state.loading = false;
        state.data = null;
        state.error = null;
      }
      break;
    }
    case "loading": {
      state.loading = payload;
      break;
    }
    case "data": {
      state.loading = false;
      state.data = payload;
      state.error = null;
      break;
    }
    case "error": {
      state.loading = false;
      state.error = payload;
      state.data = null;
      break;
    }
  }

  return { ...state };
}
