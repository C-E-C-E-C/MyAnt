import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCurrentUser } from "@/lib/api";
import { loadAuthSession, saveAuthSession, type AuthSession } from "@/lib/auth";
import {
  fetchEpisodesByMediaId,
  fetchFavoriteStatus,
  fetchMediaById,
  toggleFavorite,
  type ContentEpisode,
  type ContentMedia,
} from "@/lib/content";
import { isInWatchLater, toggleWatchLater } from "@/lib/watch-later";

const fallbackPoster = "https://picsum.photos/900/1400?detail=1";

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

function formatYear(value: string | null) {
  if (!value) {
    return "未更新";
  }

  return value.replace(/-/g, "/").slice(0, 7);
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

function buildEpisodeTitle(episode: ContentEpisode) {
  return episode.episodeTitle || `第 ${episode.episodeNo} 集`;
}

export default function DetailScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    title?: string | string[];
    image?: string | string[];
    views?: string | string[];
    year?: string | string[];
    episodes?: string | string[];
    playUrl?: string | string[];
    episodeTitle?: string | string[];
  }>();

  const mediaId = parseId(params.id);
  const legacyTitle = pickParam(params.title, "我推的孩子");
  const legacyPoster = pickParam(params.image, fallbackPoster);
  const legacyViews = pickParam(params.views, "1591.9万");
  const legacyYear = pickParam(params.year, "2023/04");
  const legacyEpisodes = pickParam(params.episodes, "共35集");
  const legacyPlayUrl = pickParam(params.playUrl, "");

  const [media, setMedia] = useState<ContentMedia | null>(null);
  const [episodes, setEpisodes] = useState<ContentEpisode[]>([]);
  const [loading, setLoading] = useState(Boolean(mediaId));
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(
    null,
  );
  const [session, setSession] = useState<AuthSession | null>(null);
  const [favoriteActive, setFavoriteActive] = useState(false);
  const [laterActive, setLaterActive] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

      try {
        const freshUser = await getCurrentUser(
          cachedSession.tokenName,
          cachedSession.tokenValue,
        );
        const nextSession = { ...cachedSession, user: freshUser };
        await saveAuthSession(nextSession);
        if (active) {
          setSession(nextSession);
        }
      } catch {
        if (active) {
          setSession(cachedSession);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMedia() {
      if (!mediaId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const [mediaData, episodeList] = await Promise.all([
          fetchMediaById(mediaId),
          fetchEpisodesByMediaId(mediaId),
        ]);

        if (!active) {
          return;
        }

        setMedia(mediaData);
        setEpisodes(episodeList);
        setSelectedEpisodeId(episodeList[0]?.id ?? null);
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "详情数据加载失败",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadMedia();

    return () => {
      active = false;
    };
  }, [mediaId]);

  useEffect(() => {
    let active = true;

    async function loadUserMarks() {
      if (!mediaId) {
        setFavoriteActive(false);
        setLaterActive(false);
        return;
      }

      try {
        const [favoriteStatus, watchLaterStatus] = await Promise.all([
          fetchFavoriteStatus(mediaId, session).catch(() => false),
          isInWatchLater(mediaId).catch(() => false),
        ]);

        if (!active) {
          return;
        }

        setFavoriteActive(Boolean(favoriteStatus));
        setLaterActive(Boolean(watchLaterStatus));
      } catch {
        if (active) {
          setFavoriteActive(false);
          setLaterActive(false);
        }
      }
    }

    void loadUserMarks();

    return () => {
      active = false;
    };
  }, [mediaId, session]);

  const activeEpisode = useMemo(() => {
    if (!episodes.length) {
      return null;
    }

    return (
      episodes.find((episode) => episode.id === selectedEpisodeId) ??
      episodes[0] ??
      null
    );
  }, [episodes, selectedEpisodeId]);

  const displayMedia = media;
  const title = displayMedia?.title ?? legacyTitle;
  const poster =
    displayMedia?.posterUrl ?? displayMedia?.coverUrl ?? legacyPoster;
  const views = displayMedia
    ? formatViews(Number(displayMedia.viewCount ?? 0))
    : legacyViews;
  const year = displayMedia ? formatYear(displayMedia.releaseDate) : legacyYear;
  const episodesText = formatEpisodesText(displayMedia, legacyEpisodes);
  const description =
    displayMedia?.detailIntro ?? displayMedia?.briefIntro ?? "暂无简介";
  const subtitle =
    displayMedia?.subtitle ??
    `${displayMedia ? getContentTypeLabel(displayMedia.contentType) : "影视"} · ${
      displayMedia?.region ?? "未知地区"
    }`;
  const tags = displayMedia?.tags
    ? displayMedia.tags.split(/[,，|]/).filter(Boolean)
    : [];
  const playUrl = activeEpisode?.playUrl ?? legacyPlayUrl;

  const stats = [
    { label: "热度", value: views },
    { label: "年份", value: year },
    { label: "集数", value: episodesText },
  ];

  const handlePlay = () => {
    if (!playUrl) {
      return;
    }

    router.push({
      pathname: "/video",
      params: {
        mediaId: String(displayMedia?.id ?? mediaId ?? ""),
        episodeId: activeEpisode ? String(activeEpisode.id) : "",
        title,
        playUrl,
        episodeTitle: activeEpisode
          ? buildEpisodeTitle(activeEpisode)
          : pickParam(params.episodeTitle, "正片"),
        poster,
      },
    });
  };

  const handleToggleFavorite = async () => {
    if (!mediaId) {
      return;
    }

    if (actionLoading) {
      return;
    }

    if (!session) {
      Alert.alert("提示", "请先登录后再收藏");
      router.push("/login");
      return;
    }

    try {
      setActionLoading(true);
      const nextState = await toggleFavorite(mediaId, session);
      setFavoriteActive(nextState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "收藏操作失败";
      Alert.alert("收藏失败", message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleWatchLater = async () => {
    if (!mediaId) {
      return;
    }

    try {
      setActionLoading(true);
      const nextState = await toggleWatchLater(mediaId);
      setLaterActive(nextState);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#ffcb6b" />
          <Text style={styles.loadingText}>正在加载详情...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>返回上一页</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroWrap}>
          <ImageBackground
            source={{ uri: poster }}
            style={styles.hero}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroOverlay} />

            <View style={styles.topBar}>
              <Pressable
                style={styles.iconButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </Pressable>

              <Pressable
                style={styles.iconButton}
                disabled={actionLoading}
                onPress={() => void handleToggleFavorite()}
              >
                <Ionicons
                  name={favoriteActive ? "heart" : "heart-outline"}
                  size={18}
                  color="#fff"
                />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                disabled={actionLoading}
                onPress={() => void handleToggleWatchLater()}
              >
                <Ionicons
                  name={laterActive ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color="#fff"
                />
              </Pressable>
            </View>

            <View style={styles.heroBottom}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeSecondary}>
                  <Text style={styles.badgeSecondaryText}>{subtitle}</Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSubtitle} numberOfLines={2}>
                {displayMedia?.subtitle ??
                  displayMedia?.briefIntro ??
                  displayMedia?.region ??
                  "影视内容详情"}
              </Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.sheet}>
          <View style={styles.statRow}>
            {stats.map((item) => (
              <View key={item.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <Button mode="contained" onPress={handlePlay} disabled={!playUrl}>
              {playUrl ? "立即播放" : "暂无播放地址"}
            </Button>

            <Button
              mode={favoriteActive ? "contained" : "contained-tonal"}
              onPress={() => void handleToggleFavorite()}
              loading={actionLoading}
            >
              {favoriteActive ? "已收藏" : "收藏"}
            </Button>

            <Button
              mode={laterActive ? "contained" : "contained-tonal"}
              onPress={() => void handleToggleWatchLater()}
              loading={actionLoading}
            >
              {laterActive ? "已加入" : "稍后再看"}
            </Button>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>剧情简介</Text>
            <Text style={styles.paragraph}>{description}</Text>
          </View>

          {tags.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>标签</Text>
              <View style={styles.tagRow}>
                {tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>选集</Text>
            {episodes.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.episodeRow}
              >
                {episodes.map((episode) => {
                  const selected = episode.id === activeEpisode?.id;

                  return (
                    <Pressable
                      key={episode.id}
                      style={[
                        styles.episodeItem,
                        selected && styles.episodeItemActive,
                      ]}
                      onPress={() => setSelectedEpisodeId(episode.id)}
                    >
                      <Text
                        style={[
                          styles.episodeItemTitle,
                          selected && styles.episodeItemTitleActive,
                        ]}
                      >
                        第 {episode.episodeNo} 集
                      </Text>
                      <Text
                        style={[
                          styles.episodeItemSub,
                          selected && styles.episodeItemSubActive,
                        ]}
                        numberOfLines={1}
                      >
                        {buildEpisodeTitle(episode)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>暂无分集数据</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            {/* <Text style={styles.sectionTitle}>主要信息</Text> */}
            <View style={styles.infoGrid}>
              {/* <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>导演</Text>
                <Text style={styles.infoValue}>
                  {displayMedia?.director ?? "-"}
                </Text>
              </View> */}
              {/* <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>地区</Text>
                <Text style={styles.infoValue}>
                  {displayMedia?.region ?? "-"}
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>评分</Text>
                <Text style={styles.infoValue}>
                  {displayMedia?.score?.toString() ?? "-"}
                </Text>
              </View> */}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  errorText: {
    color: "#fecaca",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  heroWrap: {
    height: 460,
  },
  hero: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  heroImage: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 10, 22, 0.56)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  iconButton: {
    padding: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroBottom: {
    paddingBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,122,69,0.18)",
  },
  badgeSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  badgeText: {
    color: "#ffb58e",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeSecondaryText: {
    color: "#edf2ff",
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
  sheet: {
    marginTop: -30,
    marginHorizontal: 14,
    borderRadius: 28,
    backgroundColor: "#111827",
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#1a2235",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statLabel: {
    color: "#8a96ab",
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  paragraph: {
    color: "#c7d0e0",
    lineHeight: 22,
    fontSize: 14,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.16)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.18)",
  },
  tagText: {
    color: "#cfe3ff",
    fontSize: 12,
    fontWeight: "600",
  },
  episodeRow: {
    paddingRight: 6,
    gap: 10,
  },
  episodeItem: {
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#1a2235",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  episodeItemActive: {
    backgroundColor: "#ffcb6b",
    borderColor: "#ffcb6b",
  },
  episodeItemTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  episodeItemTitleActive: {
    color: "#10131c",
  },
  episodeItemSub: {
    marginTop: 4,
    color: "#8a96ab",
    fontSize: 11,
  },
  episodeItemSubActive: {
    color: "#10131c",
  },
  emptyBox: {
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: "#1a2235",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#8a96ab",
    fontSize: 13,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoCard: {
    width: "48%",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#1a2235",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  infoLabel: {
    color: "#8a96ab",
    fontSize: 12,
    marginBottom: 6,
  },
  infoValue: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
});
