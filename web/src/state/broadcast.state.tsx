import { BroadcastDTO, BroadcastMessageDTO } from '@model/broadcast.model';
import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';

export type BroadcastState = {
	broadcasts?: Map<BroadcastDTO['entity'], BroadcastDTO>;
	isConnected?: boolean;
	updated?: number;
	dispatch?: React.Dispatch<ActionType>;
	send?: (message: BroadcastMessageDTO) => void;
};

export type ActionType =
	| {
			type: 'ADD_BROADCAST';
			payload: BroadcastDTO;
	  }
	| {
			type: 'SET_CONNECTION_STATUS';
			payload: boolean;
	  };

export const BroadcastContext = createContext<BroadcastState>({});

export function useBroadcast() {
	const context = useContext(BroadcastContext);
	if (!context) {
		throw new Error('useBroadcast must be used within a BroadcastProvider');
	}

	return context;
}

export function BroadcastProvider({ children, env }: any) {
	const [state, dispatch] = useReducer(reducer, { broadcasts: new Map() });
	const connection = useRef<BroadcastManager>();

	const handleSendMessage = useCallback((message: BroadcastMessageDTO) => {
		if (connection.current) {
			connection.current.sendMessage(JSON.stringify(message));
		}
	}, []);

	useEffect(() => {
		const protocol = window.location.protocol === 'https:'? 'wss:' : 'ws:';
		const WS_URL = `${protocol}//${window.location.hostname}/ws`;
		const manager = new BroadcastManager(WS_URL);

		manager.addEventListener('open', () => {
			dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
		});

		manager.addEventListener('message', (event) => {
			// console.log(`Message from server: ${event.data}`);
		});

		let closeTimer: NodeJS.Timeout | null = null;

		manager.addEventListener('close', (event) => {
			dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });

			if (event?.wasClean === false) {
				closeTimer = setTimeout(() => {
					manager.reconnect();
				}, 3000);
			}
		});

		connection.current = manager;

		manager.connect();

		return () => {
			clearTimeout(Number(closeTimer));

			if (connection.current) {
				connection.current.close();
			}
		};
	}, []);

	return (
		<BroadcastContext.Provider value={{ ...state, dispatch, send: handleSendMessage }}>
			{children}
		</BroadcastContext.Provider>
	);
}

function reducer(state: BroadcastState, action: ActionType): BroadcastState {
	switch (action.type) {
		case 'ADD_BROADCAST': {
			state.broadcasts?.set(action.payload.entity, action.payload);

			return { ...state, updated: Date.now() };
		}
		case 'SET_CONNECTION_STATUS': {
			return { ...state, isConnected: action.payload };
		}
		default:
			return state;
	}
}

type ListenerType = 'open' | 'message' | 'close';
class BroadcastManager {
	static ws?: WebSocket;
	url: string;
	listeners: Map<ListenerType, (data: any) => void> = new Map();
	attempts = 0;
	maxAttempts = 3;
	error = null;

	constructor(url: string) {
		this.url = url;
		this.attempts = 0;
		this.error = null;
	}

	get ws() {
		return BroadcastManager.ws;
	}

	set ws(value) {
		if (BroadcastManager.ws != null) {
			BroadcastManager.ws.close();
		}

		BroadcastManager.ws = value;
	}

	reconnect() {
		this.attempts++;

		if (this.attempts >= this.maxAttempts) {
			// console.error('Failed to connect to WebSocket server');
            return;
        }

		this.ws = undefined;
        this.connect();
	}

	connect() {
		this.error = null;

		try {
			this.ws = new WebSocket(this.url);
		} catch(error: any) {
			this.error = error;
			this.attempts = this.maxAttempts;
		}

		if (!this.ws || this.error) {
			return;
		}

		this.ws.onopen = (event: Event) => {
			this.dispatchListeners('open', event);
		};

		this.ws.onmessage = (event) => {
			this.dispatchListeners('message', event);
		};

		this.ws.onclose = (event: CloseEvent) => {
			this.dispatchListeners('close', event);
		};
	}

	close() {
		if (this.ws) {
			this.attempts = this.maxAttempts;
			this.ws.close();
			this.ws = undefined;
		}
	}

	sendMessage(message: string) {
		this.ws?.send(message);
	}

	dispatchListeners(type: ListenerType, data: any) {
		const callback = this.listeners.get(type);

		if (callback) {
			callback(data);
		}
	}

	addEventListener(type: ListenerType, callback: (data: any) => void) {
		this.listeners.set(type, callback);
	}

	removeEventListener(type: ListenerType) {
		this.listeners.delete(type);
	}
}
