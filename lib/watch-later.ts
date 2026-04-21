import AsyncStorage from "@react-native-async-storage/async-storage";

const WATCH_LATER_KEY = "@myantapp/watch-later";

export interface WatchLaterRecord {
  mediaId: number;
  addedAt: string;
}

async function readWatchLaterList() {
  const value = await AsyncStorage.getItem(WATCH_LATER_KEY);
  if (!value) {
    return [] as WatchLaterRecord[];
  }

  try {
    return JSON.parse(value) as WatchLaterRecord[];
  } catch {
    await AsyncStorage.removeItem(WATCH_LATER_KEY);
    return [] as WatchLaterRecord[];
  }
}

async function writeWatchLaterList(list: WatchLaterRecord[]) {
  await AsyncStorage.setItem(WATCH_LATER_KEY, JSON.stringify(list));
}

export async function fetchWatchLaterList() {
  return readWatchLaterList();
}

export async function isInWatchLater(mediaId: number) {
  const list = await readWatchLaterList();
  return list.some((item) => Number(item.mediaId) === Number(mediaId));
}

export async function toggleWatchLater(mediaId: number) {
  const list = await readWatchLaterList();
  const exists = list.some((item) => Number(item.mediaId) === Number(mediaId));

  if (exists) {
    const nextList = list.filter(
      (item) => Number(item.mediaId) !== Number(mediaId),
    );
    await writeWatchLaterList(nextList);
    return false;
  }

  await writeWatchLaterList([
    ...list,
    { mediaId, addedAt: new Date().toISOString() },
  ]);
  return true;
}

export async function removeFromWatchLater(mediaId: number) {
  const list = await readWatchLaterList();
  await writeWatchLaterList(
    list.filter((item) => Number(item.mediaId) !== Number(mediaId)),
  );
}

export async function clearWatchLater() {
  await AsyncStorage.removeItem(WATCH_LATER_KEY);
}
