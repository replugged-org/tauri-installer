import { DiscordPlatform } from "../../types";
import { homeDir, join } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/api/shell";
import { exists, promiseFind } from "../../util";

const ProcessRegex: Record<DiscordPlatform, RegExp> = {
  stable: /discord$/i,
  ptb: /discord-?ptb$/i,
  canary: /discord-?canary$/i,
  development: /discord-?development$/i,
};

export const getAppDir = async (platform: DiscordPlatform): Promise<string | null> => {
  const homedir = await homeDir();
  const flatpakDir = "/var/lib/flatpak/app/com.discordapp";
  const homeFlatpakDir = `${homedir}/.local/share/flatpak/app/com.discordapp`;

  // NOTE: anything here needs to be added to tauri.conf.json
  const KnownLinuxPaths: Record<DiscordPlatform, string[]> = {
    stable: [
      "/usr/share/discord",
      "/usr/lib64/discord",
      "/opt/discord",
      "/opt/Discord",
      `${flatpakDir}.Discord/current/active/files/discord`,
      `${homeFlatpakDir}.Discord/current/active/files/discord`,
      `${homedir}/.local/bin/Discord`,
    ],
    ptb: [
      "/usr/share/discord-ptb",
      "/usr/lib64/discord-ptb",
      "/opt/discord-ptb",
      "/opt/DiscordPTB",
      `${homedir}/.local/bin/DiscordPTB`,
    ],
    canary: [
      "/usr/share/discord-canary",
      "/usr/lib64/discord-canary",
      "/opt/discord-canary",
      "/opt/DiscordCanary",
      `${flatpakDir}.DiscordCanary/current/active/files/discord-canary`,
      `${homeFlatpakDir}.DiscordCanary/current/active/files/discord-canary`,
      `${homedir}/.local/bin/DiscordCanary`, // https://github.com/powercord-org/powercord/pull/370
    ],
    development: [
      "/usr/share/discord-development",
      "/usr/lib64/discord-development",
      "/opt/discord-development",
      "/opt/DiscordDevelopment",
      `${homedir}/.local/bin/DiscordDevelopment`,
    ],
  };

  const discordProcess = (await new Command("ps", ["x"]).execute()).stdout
    .split("\n")
    .map((s) => s.split(" ").filter(Boolean))
    .find((p) => p[4] && ProcessRegex[platform].test(p[4]) && p.includes("--type=renderer"));

  if (!discordProcess) {
    const discordPath = await promiseFind(
      KnownLinuxPaths[platform],
      async (path) => await exists(path),
    );

    // TODO: Ask user for path
    if (!discordPath) return null;

    return await join(discordPath, "resources", "app.asar");
  }

  const discordPath = discordProcess[4].split("/");
  discordPath.splice(discordPath.length - 1, 1);
  return await join("/", ...discordPath, "resources", "app.asar");
};
