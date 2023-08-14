import * as darwin from "./platforms/darwin";
import * as linux from "./platforms/linux";
import * as win32 from "./platforms/win32";
import { DiscordPlatform, PLATFORMS, PlatformData } from "../types";
import { inject, uninject } from "./injector";
import { join } from "@tauri-apps/api/path";
import { type OsType, type as osType } from "@tauri-apps/api/os";
import { exists } from "../util";

interface PlatformModule {
  getAppDir: (platform: DiscordPlatform) => string | null | Promise<string | null>;
}

const platformModules: Record<OsType, PlatformModule> = {
  Darwin: darwin,
  Linux: linux,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Windows_NT: win32,
};

const checkInstalled = async (appDir: string): Promise<boolean> =>
  await exists(await join(appDir, ".."));
const checkPlugged = async (appDir: string): Promise<boolean> =>
  await exists(await join(appDir, "..", "app.orig.asar"));

async function getInstallation(platform: DiscordPlatform): Promise<PlatformData> {
  try {
    const os = await osType();
    const platformModule = platformModules[os];
    const path = await platformModule.getAppDir(platform);
    if (!path) return { installed: false, plugged: false, path: null };
    const installed = await checkInstalled(path);
    if (!installed) return { installed: false, plugged: false, path: null };
    const plugged = await checkPlugged(path);

    return { installed, plugged, path };
  } catch (err) {
    console.error("Error getting installation", err);
    return { installed: false, plugged: false, path: null };
  }
}

export async function listInstallations(): Promise<Record<DiscordPlatform, PlatformData>> {
  return Object.fromEntries(
    await Promise.all(
      PLATFORMS.map(async (platform) => [platform, await getInstallation(platform)]),
    ),
  ) as Record<DiscordPlatform, PlatformData>;
}

export async function plug(platform: DiscordPlatform): Promise<boolean> {
  console.log(`Plugging ${platform}`);
  const { plugged, path } = await getInstallation(platform);
  if (!path) return false;
  if (plugged) {
    console.log(`Need to unplug ${platform} first`);
    const success = await uninject(path)
      .then(() => true)
      .catch(() => false);

    if (!success) return false;
    const { plugged } = await getInstallation(platform);
    if (plugged) return false;
    console.log(`Unplugged successfully, now replugging ${platform}`);
  }
  return await inject(path)
    .then(() => true)
    .catch((err) => {
      console.error(`Error injecting ${platform}`, err);
      return false;
    });
}

export async function unplug(platform: DiscordPlatform): Promise<boolean> {
  console.log(`Unplugging ${platform}`);
  const { plugged, path } = await getInstallation(platform);
  if (!path) return false;
  if (!plugged) return true;
  return await uninject(path)
    .then(() => true)
    .catch((err) => {
      console.error(`Error uninjecting ${platform}`, err);
      return false;
    });
}
