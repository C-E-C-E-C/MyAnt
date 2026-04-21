import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SegmentedButtons, TextInput } from "react-native-paper";

import { fetchMediaList, type ContentMedia } from "@/lib/content";

const tabs = [
  { value: "推荐", label: "推荐" },
  { value: "热门", label: "热门" },
];

const fallbackPoster = "https://picsum.photos/400/600?movie-fallback";

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

function buildEpisodesText(item: ContentMedia) {
  if (item.totalEpisodes && item.totalEpisodes > 0) {
    return `共${item.totalEpisodes}集`;
  }

  if (item.latestEpisodeNo && item.latestEpisodeNo > 0) {
    return `更新至第${item.latestEpisodeNo}集`;
  }

  return "连载中";
}

function buildFeaturedList(
  list: ContentMedia[],
  selector: (item: ContentMedia) => boolean,
) {
  const filtered = list.filter(selector);
  return filtered.length > 0 ? filtered : list;
}

function sortByViewCount(list: ContentMedia[]) {
  return [...list].sort(
    (left, right) => Number(right.viewCount ?? 0) - Number(left.viewCount ?? 0),
  );
}

function sortByScore(list: ContentMedia[]) {
  return [...list].sort((left, right) => {
    const rightScore = Number(right.score ?? 0);
    const leftScore = Number(left.score ?? 0);
    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return Number(right.viewCount ?? 0) - Number(left.viewCount ?? 0);
  });
}

function sortByRecent(list: ContentMedia[]) {
  return [...list].sort((left, right) => {
    const leftDate = left.releaseDate
      ? new Date(left.releaseDate).getTime()
      : 0;
    const rightDate = right.releaseDate
      ? new Date(right.releaseDate).getTime()
      : 0;
    return rightDate - leftDate;
  });
}

function MediaCard({
  item,
  width,
  onPress,
}: {
  item: ContentMedia;
  width: number;
  onPress: () => void;
}) {
  const poster = item.coverUrl ?? item.posterUrl ?? fallbackPoster;

  return (
    <Pressable style={[styles.showcaseCard, { width }]} onPress={onPress}>
      <Image
        source={{ uri: poster }}
        style={styles.showcaseImage}
        resizeMode="cover"
      />
      <Text style={styles.showcaseBadge}>
        {getContentTypeLabel(item.contentType)}
      </Text>
      <Text style={styles.showcaseTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.showcaseMeta} numberOfLines={1}>
        {formatReleaseDate(item.releaseDate)} · {buildEpisodesText(item)}
      </Text>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const headerIconSize = Math.max(
    36,
    Math.min(44, Math.round(screenWidth * 0.1)),
  );
  const showcaseCardWidth = Math.max(
    96,
    Math.min(144, Math.round(screenWidth * 0.3)),
  );
  const [value, setValue] = useState("推荐");
  const [keyword, setKeyword] = useState("");
  const [mediaList, setMediaList] = useState<ContentMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMediaList() {
      setLoading(true);
      setErrorMessage("");
      try {
        const list = await fetchMediaList();
        if (active) {
          setMediaList(list);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "内容数据加载失败",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadMediaList();

    return () => {
      active = false;
    };
  }, []);

  const scopedMedia = useMemo(() => {
    const baseList =
      value === "热门"
        ? buildFeaturedList(mediaList, (item) => Number(item.isHot) === 1)
        : buildFeaturedList(
            mediaList,
            (item) => Number(item.isRecommend) === 1,
          );

    const lowerKeyword = keyword.trim().toLowerCase();
    const keywordFiltered = lowerKeyword
      ? baseList.filter((item) => {
          return [
            item.title,
            item.subtitle,
            item.director,
            item.tags,
            item.mediaCode,
          ]
            .filter(Boolean)
            .some((field) =>
              String(field).toLowerCase().includes(lowerKeyword),
            );
        })
      : baseList;

    return keywordFiltered.length > 0 ? keywordFiltered : baseList;
  }, [keyword, mediaList, value]);

  const hotMedia = useMemo(
    () => sortByViewCount(scopedMedia).slice(0, 8),
    [scopedMedia],
  );
  const recommendedMedia = useMemo(
    () => sortByScore(scopedMedia).slice(0, 8),
    [scopedMedia],
  );
  const recentMedia = useMemo(
    () => sortByRecent(scopedMedia).slice(0, 8),
    [scopedMedia],
  );
  const heroMedia = useMemo(
    () => sortByViewCount(scopedMedia).slice(0, 4),
    [scopedMedia],
  );

  const openDetail = (item: ContentMedia) => {
    router.push({
      pathname: "/detail",
      params: {
        id: String(item.id),
      },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f6f6fa", marginTop: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          padding: 20,
        }}
      >
        <Image
          source={require("../../images/tab_book_2.png")}
          style={{
            width: headerIconSize,
            height: headerIconSize,
            borderRadius: 50,
            backgroundColor: "#e43737",
          }}
        />
        <TextInput
          mode="outlined"
          placeholder="搜索标题、标签、导演..."
          value={keyword}
          onChangeText={setKeyword}
          style={{
            flex: 1,
            minWidth: 0,
            height: 40,
            backgroundColor: "#fff",
            borderRadius: 20,
          }}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>

      <View style={{ padding: 10, backgroundColor: "#f6f6fa" }}>
        <SegmentedButtons
          value={value}
          onValueChange={setValue}
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
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.title}>热映电影</Text>
        <Text style={styles.subtitle}>来自内容管理表的真实数据</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: 190, paddingLeft: 10 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {loading ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator color="#d97706" />
              <Text style={styles.loadingText}>正在加载内容...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.inlineLoading}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : (
            heroMedia.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                width={showcaseCardWidth}
                onPress={() => openDetail(item)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.title}>精彩演出</Text>
        <Text style={styles.subtitle}>按评分筛选的数据库内容</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: 190, paddingLeft: 10 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {recommendedMedia.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              width={showcaseCardWidth}
              onPress={() => openDetail(item)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.title}>限时特惠</Text>
        <Text style={styles.subtitle}>这里先展示最新上线内容</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: 190, paddingLeft: 10 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {recentMedia.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              width={showcaseCardWidth}
              onPress={() => openDetail(item)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.title}>近期热播</Text>
        <Text style={styles.subtitle}>点击任意卡片进入数据库详情页</Text>
      </View>

      <View style={styles.cardGrid}>
        {scopedMedia.map((item) => {
          const poster = item.coverUrl ?? item.posterUrl ?? fallbackPoster;

          return (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => openDetail(item)}
            >
              <View style={styles.posterWrap}>
                <Image
                  source={{ uri: poster }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />

                <AntDesign
                  name="heart"
                  size={18}
                  color="#fff"
                  style={styles.favoriteIcon}
                />

                <View style={styles.viewsBadge}>
                  <AntDesign name="eye" size={12} color="#fff" />
                  <Text style={styles.viewsText}>
                    {formatViews(Number(item.viewCount ?? 0))}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  【{item.title}】
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText} numberOfLines={1}>
                    {formatReleaseDate(item.releaseDate)}
                  </Text>
                  <Text style={styles.episodeTag} numberOfLines={1}>
                    {buildEpisodesText(item)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },
  inlineLoading: {
    width: 240,
    height: 160,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 12,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    textAlign: "center",
  },
  showcaseCard: {
    aspectRatio: 0.7,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  showcaseImage: {
    width: "100%",
    height: 115,
  },
  showcaseBadge: {
    marginTop: 8,
    marginLeft: 8,
    fontSize: 11,
    color: "#d97706",
    fontWeight: "700",
  },
  showcaseTitle: {
    marginTop: 4,
    marginHorizontal: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  showcaseMeta: {
    marginTop: 2,
    marginHorizontal: 8,
    fontSize: 11,
    color: "#64748b",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 12,
  },
  card: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  posterWrap: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 250,
  },
  favoriteIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  viewsBadge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  viewsText: {
    color: "#fff",
    fontSize: 11,
    marginLeft: 4,
    fontWeight: "600",
  },
  cardBody: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    color: "#64748b",
  },
  episodeTag: {
    fontSize: 12,
    color: "#2563eb",
    backgroundColor: "#eaf2ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
});
