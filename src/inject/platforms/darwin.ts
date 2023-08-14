import { DiscordPlatform } from "../../types";

const PATHS: Record<DiscordPlatform, string> = {
  stable: "/Applications/Discord.app/Contents/Resources/app.asar",
  ptb: "/Applications/Discord PTB.app/Contents/Resources/app.asar",
  canary: "/Applications/Discord Canary.app/Contents/Resources/app.asar",
  development: "/Applications/Discord Development.app/Contents/Resources/app.asar",
};

export const getAppDir = (platform: DiscordPlatform): string => PATHS[platform];
