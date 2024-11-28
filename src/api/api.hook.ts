import { waitForMS } from "@control/api.control";
import { useReducer } from "react";

interface IProps<P, T> {
  initialState?: T | null;
  request: (props: P) => Promise<T>;
  minDuration?: number;
}

interface IState<T> {
  data: T;
  loading: boolean;
}

type IAction<T> =
  | { type: "loading"; payload: boolean }
  | { type: "data"; payload: T }
  | { type: "clear"; payload: T };

interface IReturn<P, T> {
  data: IState<T>["data"];
  loading: IState<T>["loading"];
  dispatch: (props?: P) => Promise<T>;
  reset: () => void;
  set: (value: T) => void;
}

export function useAPI<P, T>({ request, initialState, minDuration = 0 }: IProps<P, T>): IReturn<P, T> {
  const [{ loading, data }, dispatchAction] = useReducer(reducer, {
    data: initialState,
    loading: false,
  });

  const dispatch = async (props: P) => {
    dispatchAction({ type: "loading", payload: true });
    const startedAt = Date.now();

    return request(props)
      .then(async (data) => {
        const now = Date.now();
        const passed = now - startedAt;
        const delay = passed < minDuration ? minDuration - passed : 0;

        await waitForMS(delay);

        dispatchAction({ type: "data", payload: data });

        return data;
      })
      .finally(() => {
				dispatchAction({ type: "loading", payload: false });
			});
  };

  const reset = () => {
    dispatchAction({ type: "clear", payload: initialState });
  };

  const set = (value: T) => {
    dispatchAction({ type: "clear", payload: value });
  };

  return { loading, data, dispatch, reset, set } as IReturn<P, T>;
}

function reducer<T>(state: IState<T>, action: IAction<T>) {
  switch (action.type) {
    case "loading": {
      return { ...state, loading: action.payload };
    }
    case "data": {
      return { ...state, data: action.payload, loading: false };
    }
    case "clear": {
      return { ...state, data: action.payload, loading: false, error: null };
    }
    default: {
      return state;
    }
  }
}
