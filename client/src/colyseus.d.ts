// colyseus.d.ts

declare module "colyseus.js" {
    import { Schema } from "@colyseus/schema";
    import { EventEmitter } from "events";
  
    export class Client {
      constructor(url: string);
      joinOrCreate<T>(roomName: string, options?: any): Promise<Room<T>>;
    }
  
    export class Room<T = any> extends EventEmitter {
      id: string;
      name: string;
      sessionId: string;
      state: T;
      send(type: string, message?: any): void;
      leave(): void;
    }
  }
  