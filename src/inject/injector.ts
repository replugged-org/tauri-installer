// import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "original-fs";
import { configDir, join, sep } from "@tauri-apps/api/path";
import { ResponseType, fetch } from "@tauri-apps/api/http";
import { createDir, exists, remove, removeDir, rename, write } from "../util";
import { readTextFile, writeBinaryFile } from "@tauri-apps/api/fs";
import { EventEmitter } from "@tauri-apps/api/shell";

const MANIFEST_URL = "https://replugged.dev/api/v1/store/dev.replugged.Replugged";
const DOWNLOAD_URL = "https://replugged.dev/api/v1/store/dev.replugged.Replugged.asar?type=install";

const moveToOrig = async (appDir: string): Promise<void> => {
  // Check if we need to move app.asar to app.orig.asar
  const origPath = await join(appDir, "..", "app.orig.asar");
  const origExists = await exists(origPath);
  if (!origExists) {
    console.log(`MV ${appDir} ${origPath}`);
    await rename(appDir, origPath);
  }

  // In case app.asar still exists, delete it
  if (await exists(appDir)) {
    console.log(`RM ${appDir}`);
    await remove(appDir);
  }

  // For discord_arch_electron
  const unpackedPath = await join(appDir, "..", "app.asar.unpacked");
  const unpackedOrigPath = await join(appDir, "..", "app.orig.asar.unpacked");
  const unpackedExists = await exists(unpackedPath);
  const unpackedOrigExists = await exists(unpackedOrigPath);
  if (unpackedExists && !unpackedOrigExists) {
    console.log(`MV ${unpackedPath} ${unpackedOrigPath}`);
    await rename(unpackedPath, unpackedOrigPath);
  }
  if (unpackedExists) {
    console.log(`RM ${unpackedPath}`);
    await removeDir(unpackedPath);
  }
};

const getConfigDir = async (): Promise<string> => await join(await configDir(), "replugged");

type Stages = "stage" | "done" | "error";
export type DownloadEmitter = EventEmitter<Stages> & {
  stage?: {
    type: Stages;
    text?: string;
  };
};

export const download = (): DownloadEmitter => {
  const emitter: DownloadEmitter = new EventEmitter<Stages>();

  const updateStage = (type: Stages, text?: string): void => {
    emitter.stage = {
      type,
      text,
    };
    emitter.emit(type, text);
  };

  (async () => {
    const configDir = await getConfigDir();
    if (!(await exists(configDir))) await createDir(configDir);
    const manifestPath = await join(configDir, "replugged.json");
    const asarPath = await join(configDir, "replugged.asar");
    let currentVersion: string | undefined;
    if (await exists(manifestPath)) {
      const manifest = JSON.parse(await readTextFile(manifestPath));
      currentVersion = manifest.version;
      console.log(`Current version is ${currentVersion}`);
    } else {
      console.log("Not already downloaded");
    }

    updateStage("stage", "Checking for updates...");
    const manifest = await fetch<{ version: string }>(MANIFEST_URL, {
      method: "GET",
      responseType: ResponseType.JSON,
    });
    const isLatest = currentVersion === manifest.data.version;
    if (isLatest) {
      console.log("Downloaded asar is already up to date");
      updateStage("done");
      return;
    }
    console.log("Downloading new version");
    updateStage("stage", `Downloading Replugged (v${manifest.data.version})...`);
    const res = await fetch<ArrayBuffer>(DOWNLOAD_URL, {
      method: "GET",
      responseType: ResponseType.Binary,
    });
    if (!res?.ok) throw new Error("Failed to download Replugged");

    updateStage("stage", "Saving to disk");
    const configDirExists = await exists(await getConfigDir());
    if (!configDirExists) await getConfigDir();
    console.log(`WRITE ${asarPath}`);
    await writeBinaryFile(asarPath, res.data);
    console.log(`WRITE ${manifestPath}`);
    await write(manifestPath, JSON.stringify(manifest.data));
    updateStage("done");
  })().catch((err) => {
    updateStage("error", err);
  });

  return emitter;
};

export const inject = async (appDir: string): Promise<void> => {
  const entryPoint = await join(await getConfigDir(), "replugged.asar");

  if (appDir.includes("flatpak")) {
    throw new Error("Flatpak is not supported yet");
    // TODO
  }

  await moveToOrig(appDir);

  console.log(`CREATE DIR ${appDir}`);
  await createDir(appDir);
  const indexPath = await join(appDir, "index.js");
  console.log(`WRITE ${indexPath}`);
  await write(indexPath, `require("${entryPoint.replace(RegExp(sep.repeat(2), "g"), "/")}")`);
  const packagePath = await join(appDir, "package.json");
  console.log("WRITE package.json");
  await write(
    packagePath,
    JSON.stringify({
      main: "index.js",
      name: "discord",
    }),
  );
  console.log("DONE INJECTING!");
};

export const uninject = async (appDir: string): Promise<void> => {
  if (await exists(appDir)) {
    console.log(`RM DIR ${appDir}`);
    await removeDir(appDir);
  }
  const origPath = await join(appDir, "..", "app.orig.asar");
  console.log(`MV ${origPath} ${appDir}`);
  await rename(origPath, appDir);

  // For discord_arch_electron
  const unpackedPath = await join(appDir, "..", "app.asar.unpacked");
  const unpackedOrigPath = await join(appDir, "..", "app.orig.asar.unpacked");
  const unpackedExists = await exists(unpackedPath);
  const unpackedOrigExists = await exists(unpackedOrigPath);
  if (unpackedOrigExists && !unpackedExists) {
    console.log(`MV ${unpackedOrigPath} ${unpackedPath}`);
    await rename(unpackedOrigPath, unpackedPath);
  }
  if (unpackedOrigExists) {
    console.log(`RM ${unpackedOrigPath}`);
    await removeDir(unpackedOrigPath);
  }

  console.log("DONE UNINJECTING!");
};
