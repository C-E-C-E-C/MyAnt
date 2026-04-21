import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchMediaList, type ContentMedia } from "@/lib/content";
import {
    fetchWatchLaterList,
    removeFromWatchLater,
    type WatchLaterRecord,
} from "@/lib/watch-later";

const fallbackPoster = "https://picsum.photos/400/600?watch-later-fallback";

type WatchLaterItem = WatchLaterRecord & {
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

function WatchLaterCard({
  item,
  onPress,
  onRemove,
}: {
  item: WatchLaterItem;
  onPress: () => void;
  onRemove: () => void;
}) {
  const media = item.media;
  const poster = media?.coverUrl ?? media?.posterUrl ?? fallbackPoster;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: poster }} style={styles.poster} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {media?.title ?? `内容 ${item.mediaId}`}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {media?.subtitle ?? media?.briefIntro ?? "稍后再看"}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          添加时间：{formatTime(item.addedAt)}
        </Text>

        <View style={styles.cardActions}>
          <Button mode="outlined" compact onPress={onRemove}>
            移除
          </Button>
          <Button mode="contained" compact onPress={onPress}>
            查看详情
          </Button>
        </View>
      </View>
    </Pressable>
  );
}

export default function WatchLaterScreen() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<WatchLaterItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [mediaList, watchLaterList] = await Promise.all([
          fetchMediaList(),
          fetchWatchLaterList(),
        ]);
        const mediaMap = new Map(mediaList.map((item) => [item.id, item]));
        const nextRecords = watchLaterList.map((item) => ({
          ...item,
          media: mediaMap.get(item.mediaId) ?? null,
        }));

        if (active) {
          setRecords(nextRecords);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "稍后再看加载失败",
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

  const sortedRecords = useMemo(
    () =>
      [...records].sort((left, right) => {
        const leftTime = left.addedAt ? new Date(left.addedAt).getTime() : 0;
        const rightTime = right.addedAt ? new Date(right.addedAt).getTime() : 0;
        return rightTime - leftTime;
      }),
    [records],
  );

  const openDetail = (item: WatchLaterItem) => {
    router.push({
      pathname: "/detail",
      params: {
        id: String(item.mediaId),
      },
    });
  };

  const handleRemove = async (item: WatchLaterItem) => {
    await removeFromWatchLater(item.mediaId);
    setRecords((current) =>
      current.filter((record) => record.mediaId !== item.mediaId),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </Pressable>
          <Text style={styles.headerTitle}>稍后再看</Text>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#ffcb6b" />
            <Text style={styles.centerText}>正在加载稍后再看...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerBox}>
            <Text style={styles.centerTitle}>加载失败</Text>
            <Text style={styles.centerText}>{errorMessage}</Text>
          </View>
        ) : sortedRecords.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.centerTitle}>暂无稍后再看</Text>
            <Text style={styles.centerText}>
              在详情页加入稍后再看后会显示在这里。
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {sortedRecords.map((item) => (
              <WatchLaterCard
                key={`${item.mediaId}-${item.addedAt}`}
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
