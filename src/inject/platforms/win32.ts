import { join, localDataDir } from "@tauri-apps/api/path";
import { DiscordPlatform } from "../../types";
import { listDir } from "../../util";

const PATHS: Record<DiscordPlatform, string> = {
  stable: "Discord",
  ptb: "DiscordPTB",
  canary: "DiscordCanary",
  development: "DiscordDevelopment",
};

export const getAppDir = async (platform: DiscordPlatform): Promise<string | null> => {
  const localAppData = await localDataDir();
  const discordPath = await join(localAppData, PATHS[platform]);
  const discordDirectory = await listDir(discordPath);

  const currentBuild = discordDirectory.filter((path) => path?.startsWith("app-")).reverse()[0];
  if (!currentBuild) return null;

  return await join(discordPath, currentBuild, "resources", "app.asar");
};
