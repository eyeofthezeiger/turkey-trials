// colyseus.d.ts

declare module "colyseus.js" {
    import { Schema } from "@colyseus/schema";
    import { EventEmitter } from "events";
  
    export class Client {
      constructor(url: string);
      joinOrCreate<T>(roomName: string, options?: any): Promise<Room<T>>;
    }
  
    interface Room<T = any> extends EventEmitter {
      id: string;
      name: string;
      sessionId: string;
      state: T;
      send(type: string, message?: any): void;
      leave(): void;
      // Add onMessage method with a type-safe signature
      onMessage<K extends keyof T>(type: K, callback: (message: T[K]) => void): void;
    }
  }
  