import { useCallback, useEffect, useReducer } from "react";
import { GET } from "src/support/request.utils";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

export const useGame = ({ tag, preload = false }) => {
  const [payload, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(
    async (filter = null) => {
      dispatch({ type: "loading", payload: true });

      await GET(`/api/game?tag=${tag}`, null, 500).then(res => res.json())
        .then((data: object) => {
          dispatch({ type: "data", payload: data });
        })
        .catch((error) => {
          dispatch({ type: "error", payload: error });
        });
    },
    [dispatch]
  );
  const clear = useCallback(() => {}, [dispatch]);

  useEffect(() => {
    if (preload) {
      load();
    }
  }, [preload]);

  return {
    loading: payload.loading,
    data: payload.data || [],
    error: payload.error,
    load,
    clear,
  };
};

type ActionType = {
  type: "loading" | "data" | "error";
  payload: boolean | string | object;
};

function reducer(state, { type, payload }: ActionType) {
  switch (type) {
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
