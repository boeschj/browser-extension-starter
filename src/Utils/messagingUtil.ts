import { detectExecutionContext, ExecutionContext } from "./messageContextUtil";

interface UniMsgMessage<T> {
  type: string;
  payload: T;
}

//TODOs
//Need to add cross-browser support. this should be pretty easy by just ifnding a way to use the 'browser' namespace
//Need to ensure all messages coming from uniMsg are prefixed with uniMsg behind the scenes so we don't conflict with other messages unrelated to us
//Add support for opening communication ports between the background and content scripts
abstract class CommunicationChannel<T> {
  abstract sendMessage(message: UniMsgMessage<T>): Promise<void>;
  abstract onMessage(handler: (message: UniMsgMessage<T>) => void): void;

  //This is for the relay logic--still need to work on this a bit more
  relayMessage<U>(
    sourceChannel: CommunicationChannel<U>,
    targetChannel: CommunicationChannel<U>,
    messageType: string
  ): void {
    sourceChannel.onMessage((message) => {
      if (message.type === messageType) {
        targetChannel
          .sendMessage(message)
          .catch((error) => console.error("Error relaying message:", error));
      }
    });
  }
}

class BackgroundChannel<T> extends CommunicationChannel<T> {
  sendMessage(message: UniMsgMessage<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }
        resolve(response);
      });
    });
  }

  onMessage(handler: (message: UniMsgMessage<T>) => void): void {
    chrome.runtime.onMessage.addListener(
      (message: UniMsgMessage<T>, sender) => {
        if (this.isValidMessage(message)) {
          handler(message);
        }
      }
    );
  }

  private isValidMessage(message: any): message is UniMsgMessage<T> {
    return message && typeof message.type === "string";
  }
}

class ContentScriptChannel<T> extends CommunicationChannel<T> {
  constructor(private tabId: number) {
    super();
  }

  sendMessage(message: UniMsgMessage<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(this.tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }
        resolve(response);
      });
    });
  }

  onMessage(handler: (message: UniMsgMessage<T>) => void): void {
    // Listen for messages from other extension components
    chrome.runtime.onMessage.addListener(
      (message: UniMsgMessage<T>, sender, sendResponse) => {
        handler(message);
      }
    );

    // Listen for window.postMessage messages
    window.addEventListener("message", (event: MessageEvent) => {
      // Ensure the message is of the expected format
      if (this.isValidMessage(event.data)) {
        handler(event.data);
      }
    });
  }

  private isValidMessage(message: any): message is UniMsgMessage<T> {
    // Add validation logic here
    return (
      typeof message === "object" && "type" in message && "payload" in message
    );
  }
}

class WindowChannel<T> extends CommunicationChannel<T> {
  constructor(private targetOrigin: string = "*") {
    super();
  }

  sendMessage(message: UniMsgMessage<T>): Promise<void> {
    window.postMessage(message, this.targetOrigin);
    return Promise.resolve();
  }

  onMessage(handler: (message: UniMsgMessage<T>) => void): void {
    window.addEventListener("message", (event: MessageEvent) => {
      if (
        event.origin === this.targetOrigin &&
        this.isValidMessage(event.data)
      ) {
        handler(event.data as UniMsgMessage<T>);
      }
    });
  }

  private isValidMessage(message: any): message is UniMsgMessage<T> {
    return message && typeof message.type === "string";
  }
}

// Enumeration for channel types
enum ChannelType {
  Background,
  Content,
  Injected,
  // Other channel types can be added here
}

// Channel Factory for creating and managing channels
class ChannelFactory {
  private static channels = new Map<string, CommunicationChannel<any>>();

  static getChannel<T>(
    type: ChannelType,
    identifier: string,
    ...args: any[]
  ): CommunicationChannel<T> {
    const currentContext = detectExecutionContext();
    const key = `${type}-${identifier}`;

    if (!this.isValidChannelForContext(type, currentContext)) {
      throw new Error(
        `Invalid channel type '${ChannelType[type]}' for the current execution context.`
      );
    }

    if (!this.channels.has(key)) {
      const channel = this.createChannel<T>(type, ...args);
      this.channels.set(key, channel);
    }
    return this.channels.get(key) as CommunicationChannel<T>;
  }

  private static isValidChannelForContext(
    type: ChannelType,
    context: ExecutionContext
  ): boolean {
    // Define logic to determine if the channel type is valid for the given context
    switch (type) {
      case ChannelType.Background:
        return context === ExecutionContext.Background;
      case ChannelType.Content:
        return context === ExecutionContext.Content;
      case ChannelType.Injected:
        return context === ExecutionContext.Injected;
      // Add other cases as needed
    }
    return false;
  }

  private static createChannel<T>(
    type: ChannelType,
    ...args: any[]
  ): CommunicationChannel<T> {
    switch (type) {
      case ChannelType.Background:
        return new BackgroundChannel<T>();
      case ChannelType.Content:
        return new ContentScriptChannel<T>(args[0]);
      case ChannelType.Injected:
        return new WindowChannel<T>(args[0]);
      // Additional cases for other channel types
    }
  }
}

//TODOs:
// work on build efficiency
// add HMR
// make sure everything is typesafe
// get webpack config up to feature parity with CRA
//.env file support
//message passing security --e.g. anti Cross site scroping and such
// ensure support for other browsers

//Browser extension message passing is a tedious and complex process, fraught with potential security issues such as cross site scripting, side channel attacks, and more. This library aims to simplify the process of message passing by providing type safe isomorphic wrapper over the browser and window.postMessage APIs for sending and receiving messages between the various components of a browser extension.
