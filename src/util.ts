import { DiscordPlatform } from "./types";
import { invoke } from "@tauri-apps/api/tauri";

export const PLATFORM_LABELS: Record<DiscordPlatform, string> = {
  stable: "Discord Stable",
  ptb: "Discord PTB",
  canary: "Discord Canary",
  development: "Discord Development",
};

export const promiseFind = async <T>(
  array: T[],
  predicate: (value: T, index: number, obj: T[]) => Promise<boolean>,
): Promise<T | undefined> => {
  const promises = array.map(predicate);
  return Promise.all(promises).then((results) => {
    const index = results.findIndex((result) => result);
    if (index === -1) return undefined;
    return array[index];
  });
};

export const exists = async (path: string): Promise<boolean> => {
  return await invoke("exists", {
    path,
  });
};

export const listDir = async (path: string): Promise<string[]> => {
  return await invoke("list_dir", {
    path,
  });
};

export const rename = async (from: string, to: string): Promise<void> => {
  return await invoke("rename", {
    from,
    to,
  });
};

export const write = async (path: string, data: string | ArrayBuffer): Promise<void> => {
  return await invoke("write", {
    path,
    data,
  });
};

export const createDir = async (path: string): Promise<void> => {
  return await invoke("create_dir", {
    path,
  });
};

export const remove = async (path: string): Promise<void> => {
  return await invoke("remove", {
    path,
  });
};

export const removeDir = async (path: string): Promise<void> => {
  return await invoke("remove_dir", {
    path,
  });
};
