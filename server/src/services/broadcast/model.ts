import WebSocket, { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { APP_NAME } from "@/config";

export enum BroadcastMessageTypeEnum {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  SYSTEM = "system",
}

export enum BroadcastEntityEnum {
  OTHER = "other",
  USER = "user",
  QUIZ = "quiz",
  ANSWER = "answer",
  COMMENT = "comment",
  TRANSACTION = "transaction",
  WALLET = "wallet",
}

export type BroadcastData = {
  entity: BroadcastEntityEnum;
  message: string | Object;
  userId?: string;
  timestamp?: string | number;
  payload?: any;
};

dotenv.config();

class BroadcastProvider {
  wss;

  constructor(port) {
    const self = this;

    if (!port) {
      return;
    }
    const wss = (this.wss = new WebSocketServer({ port: port }));

    console.log(`WebSocket server is running at port: ${port}`);

    wss.on("open", () => {
      console.log(`WebSocket server is opened`);
    });

    wss.on("connection", (connection) => self.onConnect(connection));
  }

  onConnect(connection: WebSocket) {
    const self = this;

    this.sendMessageToConnection(connection, {
      text: `Welcome to the ${APP_NAME} broadcast!`,
    });

    connection.isAlive = true;

    connection.on("pong", () => {
      connection.isAlive = true;
    });

    connection.on("message", (message, isBinary) => {
      self.send(
        {
          entity: BroadcastEntityEnum.USER,
          message: parseMessage(message),
          userId: connection?.upgradeReq?.socket?.remoteAddress,
          timestamp: Date.now(),
        },
        [connection]
      );
    });

    connection.on("close", () => {});
  }

  sendMessageToConnection(connection, message, props = null) {
    this.sendToConnection(connection, {
      entity: BroadcastEntityEnum.OTHER,
      message: message,
    });
  }

  sendToConnection(connection, broadcast: BroadcastData) {
    if (connection) {
      connection.send(JSON.stringify(broadcast) + "\n");
    }
  }

  send(broadcast: BroadcastData, ignore: WebSocket[] = []) {
    if (this.wss) {
      const clients = this.wss.clients;

      if (!clients.size) return;

      console.log("Broadcast to clients", { size: clients.size });

      this.wss.clients.forEach((client) => {
        if (client.isAlive === false) return client.terminate();

        const shouldIgnore = ignore?.some((it) => {
          return it == client;
        });

        if (!shouldIgnore && client.readyState === WebSocket.OPEN) {
          this.sendToConnection(client, broadcast);
        }

        client.isAlive = false;
        client.ping();
      });
    }
  }
}

function parseMessage(message) {
  if (typeof message === "string" || message == null) return message;

  const value = message.toString("utf8");

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

const port = process.env.WS_PORT;

export const broadcastManager = new BroadcastProvider(port);
