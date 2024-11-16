// useRoom.ts

import { useEffect, useState } from "react";
import { Client, Room } from "colyseus.js";
import { RedLightGreenLightRoomMessages } from "./types/types";

export const useRoom = (roomName: string) => {
  const [room, setRoom] = useState<Room<RedLightGreenLightRoomMessages> | null>(null);

  useEffect(() => {
    const client = new Client("ws://localhost:2567"); // Update with your Colyseus server URL

    client.joinOrCreate<RedLightGreenLightRoomMessages>(roomName)
      .then((joinedRoom) => {
        setRoom(joinedRoom);
        console.log(`Joined room: ${roomName}`);
      })
      .catch((error) => {
        console.error("Error joining room:", error);
      });

    // Clean up on unmount
    return () => {
      room?.leave();
      console.log("Left room:", roomName);
    };
  }, [roomName]);

  return room;
};
