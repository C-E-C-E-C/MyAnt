import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { loadAuthSession } from "@/lib/auth";
import {
    fetchMediaList,
    fetchMyWatchHistory,
    removeWatchHistory,
    type ContentMedia,
    type WatchHistoryRecord,
} from "@/lib/content";

const fallbackPoster = "https://picsum.photos/400/600?history-fallback";

type HistoryItem = WatchHistoryRecord & {
  media: ContentMedia | null;
};

function formatTime(value: string | null) {
  if (!value) {
    return "刚刚";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatProgress(
  progressSeconds: number | null,
  totalSeconds: number | null,
) {
  const progress = Number(progressSeconds ?? 0);
  const total = Number(totalSeconds ?? 0);
  if (!total) {
    return `${Math.floor(progress / 60)} 分钟`;
  }

  return `${Math.floor(progress / 60)} / ${Math.ceil(total / 60)} 分钟`;
}

function formatPercent(
  progressSeconds: number | null,
  totalSeconds: number | null,
) {
  const progress = Number(progressSeconds ?? 0);
  const total = Number(totalSeconds ?? 0);
  if (!total) {
    return 0;
  }

  return Math.min(100, Math.round((progress / total) * 100));
}

function HistoryCard({
  item,
  onPress,
  onRemove,
}: {
  item: HistoryItem;
  onPress: () => void;
  onRemove: () => void;
}) {
  const media = item.media;
  const poster = media?.coverUrl ?? media?.posterUrl ?? fallbackPoster;
  const percent = formatPercent(item.progressSeconds, item.totalSeconds);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: poster }} style={styles.poster} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {media?.title ?? `内容 ${item.mediaId}`}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {media?.subtitle ?? media?.briefIntro ?? "观看历史"}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          进度 {formatProgress(item.progressSeconds, item.totalSeconds)} ·{" "}
          {percent}%
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          最近观看：{formatTime(item.lastWatchTime)}
        </Text>

        <View style={styles.cardActions}>
          <Button mode="outlined" compact onPress={onRemove}>
            删除
          </Button>
          <Button mode="contained" compact onPress={onPress}>
            继续观看
          </Button>
        </View>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setErrorMessage("");

      const session = await loadAuthSession();
      if (!session) {
        if (active) {
          setSessionReady(false);
          setLoading(false);
        }
        return;
      }

      setSessionReady(true);

      try {
        const [mediaList, watchHistory] = await Promise.all([
          fetchMediaList(),
          fetchMyWatchHistory(session),
        ]);
        const mediaMap = new Map(mediaList.map((item) => [item.id, item]));
        const nextHistory = watchHistory.map((item) => ({
          ...item,
          media: mediaMap.get(item.mediaId) ?? null,
        }));

        if (active) {
          setHistory(nextHistory);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "历史记录加载失败",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const sortedHistory = useMemo(
    () =>
      [...history].sort((left, right) => {
        const leftTime = left.lastWatchTime
          ? new Date(left.lastWatchTime).getTime()
          : 0;
        const rightTime = right.lastWatchTime
          ? new Date(right.lastWatchTime).getTime()
          : 0;
        return rightTime - leftTime;
      }),
    [history],
  );

  const openDetail = (item: HistoryItem) => {
    router.push({
      pathname: "/detail",
      params: {
        id: String(item.mediaId),
      },
    });
  };

  const handleRemove = async (item: HistoryItem) => {
    try {
      const session = await loadAuthSession();
      await removeWatchHistory(item.mediaId, session);
      setHistory((current) =>
        current.filter((record) => record.mediaId !== item.mediaId),
      );
    } catch (error) {
      Alert.alert(
        "删除失败",
        error instanceof Error ? error.message : "请稍后再试",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </Pressable>
          <Text style={styles.headerTitle}>历史记录</Text>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#ffcb6b" />
            <Text style={styles.centerText}>正在加载历史记录...</Text>
          </View>
        ) : !sessionReady ? (
          <View style={styles.centerBox}>
            <Text style={styles.centerTitle}>请先登录</Text>
            <Text style={styles.centerText}>登录后可同步你的观看历史。</Text>
            <Button mode="contained" onPress={() => router.push("/login")}>
              去登录
            </Button>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerBox}>
            <Text style={styles.centerTitle}>加载失败</Text>
            <Text style={styles.centerText}>{errorMessage}</Text>
          </View>
        ) : sortedHistory.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.centerTitle}>暂无历史记录</Text>
            <Text style={styles.centerText}>播放过的视频会出现在这里。</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {sortedHistory.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onPress={() => openDetail(item)}
                onRemove={() => void handleRemove(item)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  page: {
    flex: 1,
    backgroundColor: "#f6f6fa",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#0b1020",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
  },
  poster: {
    width: 96,
    height: 136,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
  },
  body: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  meta: {
    fontSize: 12,
    color: "#64748b",
  },
  cardActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  centerText: {
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },
});
