import { Client, Room } from "colyseus.js";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const SERVER_URL = "ws://localhost:2567"; // Replace with your Colyseus server URL

interface ClientContextProps {
  room: Room | null;
  connectToRoom: (name: string, color: string) => Promise<void>;
  sendMessage: (type: string, data?: any) => void; // Add sendMessage function
  connectionStatus: string;
  shouldReconnect: boolean;
}

const ClientContext = createContext<ClientContextProps | null>(null);

const ClientProvider = ({ children }: PropsWithChildren) => {
  const [shouldReconnect, setShouldReconnect] = useState(true);
  const [client] = useState(new Client(SERVER_URL));
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Not connected");

  const connectToRoom = useCallback(
    async (name: string, color: string) => {
      try {
        const joinedRoom = await client.joinOrCreate("game_lobby", {
          name,
          color,
        });
        setRoom(joinedRoom);
        setConnectionStatus(`Connected to room: ${joinedRoom.id}`);
      } catch (error) {
        console.error("Failed to connect to the room:", error);
        setConnectionStatus("Failed to connect");
      }
    },
    [client],
  );

  const sendMessage = useCallback(
    (type: string, data?: any) => {
      if (room) {
        room.send(type, data);
      } else {
        console.warn("No room connected to send message");
      }
    },
    [room],
  );

  useEffect(() => {
    if (room) {
      room.onLeave(() => {
        setConnectionStatus("Disconnected");
        setRoom(null);
        setShouldReconnect(false);
      });
    }
  }, [room]);

  return (
    <ClientContext.Provider
      value={{
        room,
        connectToRoom,
        sendMessage, // Provide sendMessage function in the context
        connectionStatus,
        shouldReconnect,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

const useClient = () => {
  const client = useContext(ClientContext);
  if (client === null) {
    throw new Error("Client context not initialized");
  }
  return client;
};

export { ClientProvider, useClient, Room };
