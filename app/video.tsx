import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video, VideoFullscreenUpdate } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Avatar,
  Button,
  TextInput as PaperTextInput,
  SegmentedButtons,
} from "react-native-paper";

import { fetchSystemUserById, type SystemUserRecord } from "@/lib/api";
import { loadAuthSession, type AuthSession } from "@/lib/auth";
import {
  createComment,
  fetchCommentsByMediaId,
  fetchMediaById,
  fetchRecommendedMedia,
  incrementMediaViewCount,
  trackWatchHistory,
  type ContentComment,
  type ContentMedia,
} from "@/lib/content";

const fallbackVideoUrl =
  "https://cenzen.asia/videos/%E5%88%AB%E5%BD%93%E6%AC%A7%E5%B0%BC%E9%85%B1%E4%BA%86/%5BSweetSub%5D%20Oniichan%20ha%20Oshimai%21%20-%2012%20%5BBDRip%5D%5B1080P%5D%5BAVC%208bit%5D%5BCHS%5D.mp4";
const fallbackPoster = "https://picsum.photos/900/1400?video-fallback";

type VideoTab = "简介" | "评论";

type EnrichedComment = ContentComment & {
  author: SystemUserRecord | null;
  displayName: string;
  avatarUrl: string | null;
  isCurrentUser: boolean;
};

function pickParam(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parseId(value: string | string[] | undefined) {
  const rawValue = pickParam(value, "");
  if (!rawValue) {
    return null;
  }

  const numberValue = Number(rawValue);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getContentTypeLabel(contentType: number | null) {
  switch (contentType) {
    case 1:
      return "电影";
    case 2:
      return "电视剧";
    case 3:
      return "动漫";
    case 4:
      return "综艺";
    case 5:
      return "短剧";
    default:
      return "内容";
  }
}

function formatViews(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "0";
  }

  const numberValue = Number(value);
  if (numberValue >= 10000) {
    return `${(numberValue / 10000).toFixed(1)}万`;
  }

  return numberValue.toLocaleString("zh-CN");
}

function formatReleaseDate(value: string | null) {
  if (!value) {
    return "未更新";
  }

  return value.slice(0, 7).replace("-", "/");
}

function formatCommentTime(value: string | null) {
  if (!value) {
    return "刚刚";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date
    .toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace("/", "-");
}

function formatEpisodesText(media: ContentMedia | null, legacyText: string) {
  if (!media) {
    return legacyText;
  }

  if (media.totalEpisodes && media.totalEpisodes > 0) {
    return `共${media.totalEpisodes}集`;
  }

  if (media.latestEpisodeNo && media.latestEpisodeNo > 0) {
    return `更新至第${media.latestEpisodeNo}集`;
  }

  return "连载中";
}

function getCommentDisplayName(
  author: SystemUserRecord | null,
  userId: number,
) {
  return author?.nickname || author?.username || `用户${userId}`;
}

function getAvatarText(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "U";
  }

  return trimmed.slice(0, 2).toUpperCase();
}

function RecommendationCard({
  item,
  onPress,
}: {
  item: ContentMedia;
  onPress: () => void;
}) {
  const poster = item.coverUrl ?? item.posterUrl ?? fallbackPoster;

  return (
    <Pressable style={styles.recommendCard} onPress={onPress}>
      <Image source={{ uri: poster }} style={styles.recommendImage} />
      <View style={styles.recommendBody}>
        <Text style={styles.recommendTag}>
          {getContentTypeLabel(item.contentType)}
        </Text>
        <Text style={styles.recommendTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.recommendMeta} numberOfLines={1}>
          {formatReleaseDate(item.releaseDate)} ·{" "}
          {formatViews(Number(item.viewCount ?? 0))} 播放
        </Text>
      </View>
    </Pressable>
  );
}

function CommentCard({ comment }: { comment: EnrichedComment }) {
  const displayName = comment.displayName;
  const avatarText = getAvatarText(displayName);

  return (
    <View style={styles.commentCard}>
      {comment.avatarUrl ? (
        <Avatar.Image size={42} source={{ uri: comment.avatarUrl }} />
      ) : (
        <Avatar.Text
          size={42}
          label={avatarText}
          style={styles.commentAvatar}
          labelStyle={styles.commentAvatarText}
        />
      )}

      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName} numberOfLines={1}>
            {displayName}
          </Text>
          {comment.isCurrentUser ? (
            <View style={styles.currentUserTag}>
              <Text style={styles.currentUserTagText}>我</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.commentTime}>
          {formatCommentTime(comment.createTime)}
        </Text>

        <Text style={styles.commentContent}>{comment.content}</Text>

        <View style={styles.commentFooter}>
          <Text style={styles.commentStat}>
            赞 {Number(comment.likeCount ?? 0)}
          </Text>
          <Text style={styles.commentStat}>
            回复 {Number(comment.replyCount ?? 0)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function VideoPlayer() {
  const params = useLocalSearchParams<{
    mediaId?: string | string[];
    episodeId?: string | string[];
    title?: string | string[];
    playUrl?: string | string[];
    episodeTitle?: string | string[];
    poster?: string | string[];
  }>();

  const mediaId = parseId(params.mediaId);
  const episodeId = parseId(params.episodeId);
  const title = pickParam(params.title, "视频播放");
  const episodeTitle = pickParam(params.episodeTitle, "正片");
  const playUrl = pickParam(params.playUrl, fallbackVideoUrl);
  const poster = pickParam(params.poster, fallbackPoster);
  const { width: screenWidth } = useWindowDimensions();
  const tabs = useMemo(
    () => [
      { value: "简介", label: "简介" },
      { value: "评论", label: "评论" },
    ],
    [],
  );
  const [value, setValue] = useState<VideoTab>("简介");
  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentMedia, setCurrentMedia] = useState<ContentMedia | null>(null);
  const [recommendations, setRecommendations] = useState<ContentMedia[]>([]);
  const [introLoading, setIntroLoading] = useState(Boolean(mediaId));
  const [introError, setIntroError] = useState("");
  const [comments, setComments] = useState<EnrichedComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(Boolean(mediaId));
  const [commentsError, setCommentsError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const viewCountTrackedRef = useRef(false);
  const lastHistorySyncRef = useRef(-1);
  const lastKnownPositionRef = useRef(0);
  const lastKnownDurationRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const cachedSession = await loadAuthSession();
      if (!cachedSession) {
        if (active) {
          setSession(null);
        }
        return;
      }

      if (active) {
        setSession(cachedSession);
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    viewCountTrackedRef.current = false;
    lastHistorySyncRef.current = -1;
    lastKnownPositionRef.current = 0;
    lastKnownDurationRef.current = 0;
  }, [mediaId, playUrl]);

  useEffect(() => {
    let active = true;

    async function loadIntro() {
      if (!mediaId) {
        setIntroLoading(false);
        setIntroError("");
        setCurrentMedia(null);
        setRecommendations([]);
        return;
      }

      setIntroLoading(true);
      setIntroError("");

      try {
        const [mediaData, recommendationList] = await Promise.all([
          fetchMediaById(mediaId),
          fetchRecommendedMedia(10, mediaId),
        ]);

        if (!active) {
          return;
        }

        setCurrentMedia(mediaData);
        setRecommendations(recommendationList);
      } catch (error) {
        if (active) {
          setIntroError(
            error instanceof Error ? error.message : "简介内容加载失败",
          );
        }
      } finally {
        if (active) {
          setIntroLoading(false);
        }
      }
    }

    void loadIntro();

    return () => {
      active = false;
    };
  }, [mediaId]);

  const refreshComments = useCallback(async () => {
    if (!mediaId) {
      setComments([]);
      setCommentsLoading(false);
      return;
    }

    setCommentsLoading(true);
    setCommentsError("");

    try {
      const commentList = await fetchCommentsByMediaId(mediaId);
      const uniqueUserIds = Array.from(
        new Set(commentList.map((comment) => Number(comment.userId))),
      );
      const userMap = new Map<number, SystemUserRecord | null>();

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const user = await fetchSystemUserById(userId);
            userMap.set(userId, user);
          } catch {
            userMap.set(userId, null);
          }
        }),
      );

      const currentUserId = session?.user.id;
      const enrichedComments = commentList.map((comment) => {
        const author = userMap.get(Number(comment.userId)) ?? null;
        const displayName = getCommentDisplayName(
          author,
          Number(comment.userId),
        );

        return {
          ...comment,
          author,
          displayName,
          avatarUrl: author?.avatarUrl ?? null,
          isCurrentUser:
            currentUserId !== undefined &&
            Number(comment.userId) === Number(currentUserId),
        };
      });

      setComments(enrichedComments);
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : "评论加载失败");
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [mediaId, session?.user.id]);

  useEffect(() => {
    void refreshComments();
  }, [refreshComments]);

  const handleLoad = useCallback((status: any) => {
    if (status.naturalWidth && status.naturalHeight) {
      setVideoAspect(status.naturalWidth / status.naturalHeight);
    }
  }, []);

  const handleFullscreenUpdate = useCallback(
    async ({ fullscreenUpdate }: any) => {
      if (fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_PRESENT) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE,
        );
      } else if (
        fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS
      ) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT,
        );
      }
    },
    [],
  );

  const handleLoadStart = useCallback(() => {
    console.log("video load start");
  }, []);

  const handleReadyForDisplay = useCallback(() => {
    console.log("video ready for display");
  }, []);

  const handleError = useCallback((error: any) => {
    console.log("video error", error);
  }, []);

  const syncWatchHistory = useCallback(
    async (status: any, forceFinished = false) => {
      if (!mediaId || !session) {
        return;
      }

      const progressSeconds = Math.max(
        0,
        Math.floor(
          (status.positionMillis ?? lastKnownPositionRef.current) / 1000,
        ),
      );
      const totalSeconds = Math.max(
        0,
        Math.floor(
          (status.durationMillis ?? lastKnownDurationRef.current) / 1000,
        ),
      );

      try {
        await trackWatchHistory(
          {
            mediaId,
            episodeId,
            progressSeconds,
            totalSeconds,
            isFinished: forceFinished || Boolean(status.didJustFinish),
          },
          session,
        );
      } catch {
        // 观看历史只做尽力上报，不影响播放流程。
      }
    },
    [episodeId, mediaId, session],
  );

  const handlePlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (!status?.isLoaded) {
        return;
      }

      const progressSeconds = Math.max(
        0,
        Math.floor((status.positionMillis ?? 0) / 1000),
      );
      const totalSeconds = Math.max(
        0,
        Math.floor((status.durationMillis ?? 0) / 1000),
      );

      lastKnownPositionRef.current = progressSeconds * 1000;
      lastKnownDurationRef.current = totalSeconds * 1000;

      if (
        status.isPlaying &&
        progressSeconds >= 3 &&
        !viewCountTrackedRef.current
      ) {
        if (!mediaId) {
          return;
        }

        viewCountTrackedRef.current = true;
        void incrementMediaViewCount(mediaId).catch(() => undefined);
      }

      const shouldSyncByInterval =
        status.isPlaying &&
        progressSeconds > 0 &&
        progressSeconds - lastHistorySyncRef.current >= 10;
      const shouldSyncOnPause =
        !status.isPlaying &&
        progressSeconds > 0 &&
        progressSeconds !== lastHistorySyncRef.current;

      if (shouldSyncByInterval || shouldSyncOnPause || status.didJustFinish) {
        lastHistorySyncRef.current = progressSeconds;
        void syncWatchHistory(status, Boolean(status.didJustFinish));
      }
    },
    [mediaId, syncWatchHistory],
  );

  const displayMedia = currentMedia;
  const displayTitle = displayMedia?.title ?? title;
  const displayPoster =
    displayMedia?.posterUrl ?? displayMedia?.coverUrl ?? poster;
  const displayDescription =
    displayMedia?.detailIntro ?? displayMedia?.briefIntro ?? "暂无简介";
  const displaySubtitle =
    displayMedia?.subtitle ??
    `${displayMedia ? getContentTypeLabel(displayMedia.contentType) : "影视"} · ${
      displayMedia?.region ?? "未知地区"
    }`;
  const displayTags = displayMedia?.tags
    ? displayMedia.tags.split(/[,，|]/).filter(Boolean)
    : [];
  const displayStats = [
    {
      label: "热度",
      value: displayMedia
        ? formatViews(Number(displayMedia.viewCount ?? 0))
        : "0",
    },
    {
      label: "年份",
      value: displayMedia
        ? formatReleaseDate(displayMedia.releaseDate)
        : "未更新",
    },
    {
      label: "集数",
      value: formatEpisodesText(displayMedia, "连载中"),
    },
  ];

  const handleOpenRecommendation = useCallback((id: number) => {
    router.push({
      pathname: "/detail",
      params: { id: String(id) },
    });
  }, []);

  const handleSubmitComment = useCallback(async () => {
    const currentSession = session;
    if (!currentSession) {
      router.push("/login");
      return;
    }

    if (!mediaId) {
      setCommentsError("当前视频缺少内容ID，无法发表评论");
      return;
    }

    const trimmedContent = commentText.trim();
    if (!trimmedContent) {
      setCommentsError("请输入评论内容");
      return;
    }

    try {
      setPostingComment(true);
      setCommentsError("");
      await createComment({
        mediaId,
        userId: currentSession.user.id,
        content: trimmedContent,
      });
      setCommentText("");
      await refreshComments();
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : "评论发布失败");
    } finally {
      setPostingComment(false);
    }
  }, [commentText, mediaId, refreshComments, session]);

  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {episodeTitle}
          </Text>
        </View>
      </View>

      <View style={styles.container}>
        <View
          style={[
            styles.videoWrapper,
            {
              width: screenWidth,
              aspectRatio: videoAspect,
            },
          ]}
        >
          <Video
            source={{ uri: playUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            onLoadStart={handleLoadStart}
            onLoad={handleLoad}
            onReadyForDisplay={handleReadyForDisplay}
            onError={handleError}
            onFullscreenUpdate={handleFullscreenUpdate}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            shouldPlay={false}
            progressUpdateIntervalMillis={500}
          />
        </View>
      </View>

      <View style={styles.panel}>
        <SegmentedButtons
          value={value}
          onValueChange={(nextValue) => setValue(nextValue as VideoTab)}
          buttons={tabs.map((item) => ({
            value: item.value,
            label: item.label,
            style: {
              backgroundColor: "#f6f6fa",
              borderWidth: 0,
            },
            labelStyle: {
              color: value === item.value ? "#ff0080" : "#333",
              fontSize: 14,
              fontWeight: value === item.value ? "500" : "400",
            },
          }))}
          style={{ width: "100%" }}
        />

        <ScrollView
          style={styles.tabContent}
          contentContainerStyle={styles.tabContentInner}
          showsVerticalScrollIndicator={false}
        >
          {value === "简介" ? (
            <View style={styles.sectionWrap}>
              <View style={styles.summaryCard}>
                <Image
                  source={{ uri: displayPoster }}
                  style={styles.summaryPoster}
                />
                <View style={styles.summaryBody}>
                  <Text style={styles.summaryKicker}>正在播放</Text>
                  <Text style={styles.summaryTitle} numberOfLines={2}>
                    {displayTitle}
                  </Text>
                  <Text style={styles.summarySubtitle} numberOfLines={2}>
                    {displaySubtitle}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                {displayStats.map((item) => (
                  <View key={item.label} style={styles.statsCard}>
                    <Text style={styles.statsLabel}>{item.label}</Text>
                    <Text style={styles.statsValue}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>剧情简介</Text>
              </View>

              {introLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color="#ffcb6b" />
                  <Text style={styles.loadingText}>正在加载简介...</Text>
                </View>
              ) : introError ? (
                <View style={styles.loadingBox}>
                  <Text style={styles.errorText}>{introError}</Text>
                </View>
              ) : (
                <Text style={styles.description}>{displayDescription}</Text>
              )}

              {displayTags.length > 0 ? (
                <View style={styles.tagWrap}>
                  {displayTags.map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>推荐模块</Text>
                <Text style={styles.sectionHint}>
                  随机推荐数据库中的 10 条视频
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendRow}
              >
                {recommendations.map((item) => (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    onPress={() => handleOpenRecommendation(item.id)}
                  />
                ))}

                {!introLoading && recommendations.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>暂无推荐内容</Text>
                  </View>
                ) : null}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>发表评论</Text>
                <Text style={styles.sectionHint}>
                  登录后可发表、刷新和查看评论
                </Text>
              </View>

              <View style={styles.commentComposer}>
                <PaperTextInput
                  mode="outlined"
                  multiline
                  label="写下你的评论"
                  placeholder="说说你对这部作品的看法"
                  value={commentText}
                  onChangeText={setCommentText}
                  style={styles.commentInput}
                  contentStyle={styles.commentInputContent}
                />

                <View style={styles.commentActions}>
                  {session ? (
                    <Text style={styles.commentLoginHint}>
                      当前账号：{session.user.nickname ?? session.user.username}
                    </Text>
                  ) : (
                    <Pressable onPress={() => router.push("/login")}>
                      <Text style={styles.loginLink}>登录后发表评论</Text>
                    </Pressable>
                  )}

                  <View style={styles.commentButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => void refreshComments()}
                      disabled={commentsLoading}
                    >
                      刷新
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => void handleSubmitComment()}
                      loading={postingComment}
                      disabled={postingComment || !session}
                    >
                      发布评论
                    </Button>
                  </View>
                </View>

                {commentsError ? (
                  <Text style={styles.errorText}>{commentsError}</Text>
                ) : null}
              </View>

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>全部评论</Text>
                <Text style={styles.sectionHint}>{comments.length} 条评论</Text>
              </View>

              {commentsLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color="#ffcb6b" />
                  <Text style={styles.loadingText}>正在加载评论...</Text>
                </View>
              ) : comments.length > 0 ? (
                <View style={styles.commentList}>
                  {comments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>还没有评论，来当第一个吧</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0b1020",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  headerSubtitle: {
    marginTop: 4,
    color: "#8a96ab",
    fontSize: 12,
  },
  container: {
    backgroundColor: "#000",
  },
  videoWrapper: {
    alignSelf: "center",
  },
  video: {
    flex: 1,
  },
  panel: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#f6f6fa",
  },
  tabContent: {
    flex: 1,
    marginTop: 12,
  },
  tabContentInner: {
    paddingBottom: 24,
  },
  sectionWrap: {
    gap: 14,
  },
  summaryCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  summaryPoster: {
    width: 96,
    height: 132,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  summaryBody: {
    flex: 1,
    justifyContent: "center",
  },
  summaryKicker: {
    fontSize: 12,
    color: "#d97706",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  summaryTitle: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  summarySubtitle: {
    marginTop: 8,
    color: "#64748b",
    lineHeight: 20,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statsCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  statsLabel: {
    color: "#64748b",
    fontSize: 12,
  },
  statsValue: {
    marginTop: 8,
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionHint: {
    flex: 1,
    textAlign: "right",
    color: "#64748b",
    fontSize: 12,
  },
  description: {
    color: "#475569",
    lineHeight: 24,
    fontSize: 14,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#eaf2ff",
  },
  tagText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "700",
  },
  loadingBox: {
    minHeight: 110,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    padding: 16,
  },
  loadingText: {
    color: "#64748b",
    fontSize: 13,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    textAlign: "center",
  },
  recommendRow: {
    gap: 12,
    paddingRight: 4,
  },
  recommendCard: {
    width: 164,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  recommendImage: {
    width: "100%",
    height: 108,
    backgroundColor: "#e5e7eb",
  },
  recommendBody: {
    padding: 10,
    gap: 4,
  },
  recommendTag: {
    color: "#d97706",
    fontSize: 11,
    fontWeight: "800",
  },
  recommendTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  recommendMeta: {
    fontSize: 11,
    color: "#64748b",
  },
  emptyBox: {
    minHeight: 110,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    padding: 16,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
  },
  commentComposer: {
    gap: 12,
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  commentInput: {
    backgroundColor: "#fff",
  },
  commentInputContent: {
    minHeight: 120,
  },
  commentActions: {
    gap: 12,
  },
  commentLoginHint: {
    color: "#64748b",
    fontSize: 12,
  },
  loginLink: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "700",
  },
  commentButtons: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  commentList: {
    gap: 12,
  },
  commentCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    padding: 14,
  },
  commentAvatar: {
    backgroundColor: "#dbeafe",
  },
  commentAvatarText: {
    color: "#1d4ed8",
    fontWeight: "800",
  },
  commentBody: {
    flex: 1,
    gap: 6,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  currentUserTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#ecfdf5",
  },
  currentUserTagText: {
    color: "#059669",
    fontSize: 11,
    fontWeight: "800",
  },
  commentTime: {
    color: "#94a3b8",
    fontSize: 11,
  },
  commentContent: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 21,
  },
  commentFooter: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
  },
  commentStat: {
    color: "#64748b",
    fontSize: 11,
  },
});
