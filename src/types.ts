export const PLATFORMS = ["stable", "ptb", "canary", "development"] as const;
export type DiscordPlatform = "stable" | "ptb" | "canary" | "development";

export type PlatformData =
  | {
      installed: false;
      plugged: boolean;
      path: null;
    }
  | {
      installed: true;
      plugged: boolean;
      path: string;
    };

export type IpcEvents = "GET_PLATFORMS" | "DOWNLOAD" | "PLUG" | "UNPLUG";
export type IpcMainEvents = "DOWNLOAD_PROGRESS" | "DOWNLOAD_DONE" | "DOWNLOAD_ERROR" | "ERROR";
