// import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "original-fs";
import { configDir, join, sep } from "@tauri-apps/api/path";
import { ResponseType, fetch } from "@tauri-apps/api/http";
import { createDir, exists, remove, removeDir, rename, write } from "../util";
import { writeBinaryFile } from "@tauri-apps/api/fs";

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
};

const getConfigDir = async (): Promise<string> => await join(await configDir(), "replugged");

export const download = async (): Promise<void> => {
  const entryPoint = await join(await getConfigDir(), "replugged.asar");

  const res = await fetch<ArrayBuffer>(DOWNLOAD_URL, {
    method: "GET",
    responseType: ResponseType.Binary,
  });
  if (!res?.ok) throw new Error("Failed to download Replugged");

  const configDirExists = await exists(await getConfigDir());
  if (!configDirExists) await getConfigDir();
  console.log(`WRITE ${entryPoint}`);
  await writeBinaryFile(entryPoint, res.data);
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
  console.log("DONE UNINJECTING!");
};
