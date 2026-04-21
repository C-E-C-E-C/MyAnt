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
    fetchMyFavorites,
    removeFavorite,
    type ContentMedia,
    type FavoriteRecord,
} from "@/lib/content";

const fallbackPoster = "https://picsum.photos/400/600?favorite-fallback";

type FavoriteItem = FavoriteRecord & {
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

function FavoriteCard({
  item,
  onPress,
  onRemove,
}: {
  item: FavoriteItem;
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
          {media?.subtitle ?? media?.briefIntro ?? "我的收藏"}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          收藏时间：{formatTime(item.createTime)}
        </Text>

        <View style={styles.cardActions}>
          <Button mode="outlined" compact onPress={onRemove}>
            删除
          </Button>
          <Button mode="contained" compact onPress={onPress}>
            查看详情
          </Button>
        </View>
      </View>
    </Pressable>
  );
}

export default function FavoritesScreen() {
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
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
        const [mediaList, favoriteList] = await Promise.all([
          fetchMediaList(),
          fetchMyFavorites(session),
        ]);
        const mediaMap = new Map(mediaList.map((item) => [item.id, item]));
        const nextFavorites = favoriteList.map((item) => ({
          ...item,
          media: mediaMap.get(item.mediaId) ?? null,
        }));

        if (active) {
          setFavorites(nextFavorites);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "收藏记录加载失败",
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

  const sortedFavorites = useMemo(
    () =>
      [...favorites].sort((left, right) => {
        const leftTime = left.createTime
          ? new Date(left.createTime).getTime()
          : 0;
        const rightTime = right.createTime
          ? new Date(right.createTime).getTime()
          : 0;
        return rightTime - leftTime;
      }),
    [favorites],
  );

  const openDetail = (item: FavoriteItem) => {
    router.push({
      pathname: "/detail",
      params: {
        id: String(item.mediaId),
      },
    });
  };

  const handleRemove = async (item: FavoriteItem) => {
    try {
      const session = await loadAuthSession();
      await removeFavorite(item.mediaId, session);
      setFavorites((current) =>
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
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </Pressable>
          <Text style={styles.headerTitle}>我的收藏</Text>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#ffcb6b" />
            <Text style={styles.centerText}>正在加载收藏记录...</Text>
          </View>
        ) : !sessionReady ? (
          <View style={styles.centerBox}>
            <Text style={styles.centerTitle}>请先登录</Text>
            <Text style={styles.centerText}>登录后可同步你的收藏列表。</Text>
            <Button mode="contained" onPress={() => router.push("/login")}>
              去登录
            </Button>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerBox}>
            <Text style={styles.centerTitle}>加载失败</Text>
            <Text style={styles.centerText}>{errorMessage}</Text>
          </View>
        ) : sortedFavorites.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.centerTitle}>暂无收藏</Text>
            <Text style={styles.centerText}>
              收藏喜欢的内容后会出现在这里。
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {sortedFavorites.map((item) => (
              <FavoriteCard
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
