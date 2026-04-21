import { requestApi, requestRaw } from "./api";
import type { AuthSession } from "./auth";

export interface ContentMedia {
  id: number;
  categoryId: number | null;
  mediaCode: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  posterUrl: string | null;
  contentType: number | null;
  region: string | null;
  director: string | null;
  briefIntro: string | null;
  detailIntro: string | null;
  tags: string | null;
  releaseDate: string | null;
  totalEpisodes: number | null;
  latestEpisodeNo: number | null;
  durationSeconds: number | null;
  score: number | null;
  scoreCount: number | null;
  viewCount: number | null;
  favoriteCount: number | null;
  commentCount: number | null;
  isHot: number | null;
  isRecommend: number | null;
  status: number | null;
  sortOrder: number | null;
  createdBy: number | null;
  updatedBy: number | null;
  createTime: string | null;
  updateTime: string | null;
}

export interface ContentEpisode {
  id: number;
  mediaId: number;
  episodeNo: number;
  episodeTitle: string;
  playUrl: string;
  durationSeconds: number | null;
  isFree: number | null;
  status: number | null;
  sortOrder: number | null;
  createTime: string | null;
  updateTime: string | null;
}

export interface ContentComment {
  id: number;
  mediaId: number;
  userId: number;
  parentId: number | null;
  content: string;
  likeCount: number | null;
  replyCount: number | null;
  status: number | null;
  createTime: string | null;
  updateTime: string | null;
}

export interface FavoriteRecord {
  id: number;
  userId: number;
  mediaId: number;
  createTime: string | null;
}

export interface WatchHistoryRecord {
  id: number;
  userId: number;
  mediaId: number;
  episodeId: number | null;
  progressSeconds: number | null;
  totalSeconds: number | null;
  isFinished: number | null;
  lastWatchTime: string | null;
  createTime: string | null;
  updateTime: string | null;
}

export async function fetchMediaList() {
  return requestRaw<ContentMedia[]>("/api/content/media/list");
}

export async function fetchMediaById(id: number) {
  return requestRaw<ContentMedia>(`/api/content/media/${id}`);
}

export async function fetchEpisodesByMediaId(mediaId: number) {
  const episodes = await requestRaw<ContentEpisode[]>(
    "/api/content/episodes/list",
  );
  return episodes
    .filter((episode) => Number(episode.mediaId) === Number(mediaId))
    .sort((left, right) => Number(left.episodeNo) - Number(right.episodeNo));
}

export async function fetchRecommendedMedia(
  limit = 10,
  excludeMediaId?: number,
) {
  const mediaList = await fetchMediaList();
  const filteredList = mediaList.filter((item) => {
    if (excludeMediaId === undefined || excludeMediaId === null) {
      return true;
    }

    return Number(item.id) !== Number(excludeMediaId);
  });

  const sourceList = filteredList.length > 0 ? filteredList : mediaList;
  return [...sourceList]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(limit, sourceList.length));
}

export async function fetchCommentsByMediaId(mediaId: number) {
  const comments = await requestRaw<ContentComment[]>(
    "/api/social/comments/list",
  );

  return comments
    .filter((comment) => Number(comment.mediaId) === Number(mediaId))
    .sort((left, right) => {
      const rightTime = right.createTime
        ? new Date(right.createTime).getTime()
        : 0;
      const leftTime = left.createTime
        ? new Date(left.createTime).getTime()
        : 0;
      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }

      return Number(right.id) - Number(left.id);
    });
}

export async function createComment(payload: {
  mediaId: number;
  userId: number;
  content: string;
  parentId?: number | null;
}) {
  return requestRaw<boolean>("/api/social/comments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMyFavorites(session?: AuthSession | null) {
  return requestApi<FavoriteRecord[]>("/api/social/favorites/me", {
    tokenName: session?.tokenName,
    tokenValue: session?.tokenValue,
  });
}

export async function fetchFavoriteStatus(
  mediaId: number,
  session?: AuthSession | null,
) {
  return requestApi<boolean>(`/api/social/favorites/status/${mediaId}`, {
    tokenName: session?.tokenName,
    tokenValue: session?.tokenValue,
  });
}

export async function toggleFavorite(
  mediaId: number,
  session?: AuthSession | null,
) {
  return requestApi<boolean>("/api/social/favorites/toggle", {
    method: "POST",
    tokenName: session?.tokenName,
    tokenValue: session?.tokenValue,
    body: JSON.stringify({ mediaId }),
  });
}

export async function removeFavorite(
  mediaId: number,
  session?: AuthSession | null,
) {
  return requestApi<void>(`/api/social/favorites/me/${mediaId}`, {
    method: "DELETE",
    tokenName: session?.tokenName,
    tokenValue: session?.tokenValue,
  });
}

export async function fetchMyWatchHistory(session?: AuthSession | null) {
  return requestApi<WatchHistoryRecord[]>("/api/social/watch-histories/me", {
    tokenName: session?.tokenName,
    tokenValue: session?.tokenValue,
  });
}

export async function fetchWatchHistoryStatus(
  mediaId: number,
  session?: AuthSession | null,
) {
  return requestApi<WatchHistoryRecord | null>(
    `/api/social/watch-histories/status/${mediaId}`,
    {
      tokenName: session?.tokenName,
      tokenValue: session?.tokenValue,
    },
  );
}

export async function trackWatchHistory(
  payload: {
    mediaId: number;
    episodeId?: number | null;
    progressSeconds?: number;
    totalSeconds?: number;
    isFinished?: boolean;
  },
  session?: AuthSession | null,
) {
  return requestApi<WatchHistoryRecord>("/api/social/watch-histories/track", {
    method: "POST",
    tokenName: session?.tokenName,
    tokenValue: session?.tokenValue,
    body: JSON.stringify(payload),
  });
}

export async function removeWatchHistory(
  mediaId: number,
  session?: AuthSession | null,
) {
  return requestApi<void>(`/api/social/watch-histories/me/${mediaId}`, {
    method: "DELETE",
    tokenName: session?.tokenName,
    tokenValue: session?.tokenValue,
  });
}

export async function incrementMediaViewCount(
  mediaId: number,
  session?: AuthSession | null,
) {
  return requestApi<number>(`/api/content/media/${mediaId}/view`, {
    method: "POST",
    tokenName: session?.tokenName,
    tokenValue: session?.tokenValue,
  });
}
