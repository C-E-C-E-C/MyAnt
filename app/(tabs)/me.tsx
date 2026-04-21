import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Icon, Surface, Text } from "react-native-paper";

import { getCurrentUser, logout } from "@/lib/api";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
  type AuthSession,
} from "@/lib/auth";

function DefaultAvatar() {
  return (
    <View style={styles.avatarFallback}>
      <Icon source="account-circle" size={72} color="#c9c9c9" />
    </View>
  );
}

export default function MeScreen() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const cachedSession = await loadAuthSession();
      if (!cachedSession) {
        setSession(null);
        setLoading(false);
        return;
      }

      try {
        const freshUser = await getCurrentUser(
          cachedSession.tokenName,
          cachedSession.tokenValue,
        );
        const nextSession = { ...cachedSession, user: freshUser };
        await saveAuthSession(nextSession);
        setSession(nextSession);
      } catch {
        await clearAuthSession();
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const loggedIn = Boolean(session);
  const user = session?.user;

  const goLogin = () => {
    router.push("/login");
  };

  const openHistory = () => {
    router.push("/history");
  };

  const openFavorites = () => {
    router.push("/favorites");
  };

  const openWatchLater = () => {
    router.push("/watch-later");
  };

  const handleLogout = async () => {
    if (session) {
      try {
        await logout(session.tokenName, session.tokenValue);
      } catch {
        // 本地退出优先，接口失败也清空登录态
      }
    }
    await clearAuthSession();
    setSession(null);
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Surface style={styles.headerSurface} elevation={0}>
        <Pressable
          style={styles.headerRow}
          onPress={loggedIn ? undefined : goLogin}
        >
          {loggedIn && user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <DefaultAvatar />
          )}

          <View style={styles.headerInfo}>
            {loggedIn ? (
              <>
                <View style={styles.nameRow}>
                  <Text style={styles.username}>
                    {user?.nickname ?? user?.username}
                  </Text>
                  <Icon source="pencil" size={16} color="#666" />
                  <View style={styles.levelTag}>
                    <Text style={styles.levelText}>LV{user?.level ?? 1}</Text>
                  </View>
                  <Text style={styles.testText}>试炼</Text>
                </View>

                <View style={styles.memberTag}>
                  <Text style={styles.memberText}>正式会员</Text>
                </View>

                <View style={styles.coinRow}>
                  <Text style={styles.coinText}>B币：0.0</Text>
                  <Text style={styles.coinText}>硬币：622</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.loginTitle}>点击登录</Text>
                <Text style={styles.loginDesc}>
                  登录后同步收藏、历史、关注和粉丝信息
                </Text>
              </>
            )}
          </View>

          <Icon source="chevron-right" size={24} color="#bbb" />
        </Pressable>
      </Surface>

      {loggedIn ? (
        <Surface style={styles.surface} elevation={0}>
          <View style={styles.item}>
            <Text style={styles.number}>1</Text>
            <Text style={styles.label}>动态</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.number}>330</Text>
            <Text style={styles.label}>关注</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.number}>9</Text>
            <Text style={styles.label}>粉丝</Text>
          </View>
        </Surface>
      ) : (
        <Surface style={styles.loginHintSurface} elevation={0}>
          {null}
          {/* <Text style={styles.loginHintTitle}>登录后可解锁完整个人中心</Text>
          <Text style={styles.loginHintDesc}>
            查看动态、关注、粉丝、收藏和观看历史
          </Text>
          <Button
            mode="contained"
            onPress={goLogin}
            style={styles.loginHintButton}
          >
            去登录 / 注册
          </Button> */}
        </Surface>
      )}

      <Surface style={styles.surface} elevation={0}>
        <Pressable style={styles.item} onPress={openHistory}>
          <Icon source="download" size={32} />
          <Text style={styles.label}>离线缓存</Text>
        </Pressable>
        <Pressable style={styles.item} onPress={openHistory}>
          <Icon source="history" size={32} />
          <Text style={styles.label}>历史记录</Text>
        </Pressable>
        <Pressable style={styles.item} onPress={openFavorites}>
          <Icon source="star" size={32} />
          <Text style={styles.label}>我的收藏</Text>
        </Pressable>
        <Pressable style={styles.item} onPress={openWatchLater}>
          <Icon source="play-circle-outline" size={32} />
          <Text style={styles.label}>稍后再看</Text>
        </Pressable>
      </Surface>

      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>更多服务</Text>
      </View>

      <Surface style={styles.verticalSurface} elevation={0}>
        <Pressable style={styles.verticalItem} onPress={openHistory}>
          <Icon source="download" size={32} />
          <Text style={styles.verticalLabel}>离线缓存</Text>
        </Pressable>
        <Pressable style={styles.verticalItem} onPress={openHistory}>
          <Icon source="history" size={32} />
          <Text style={styles.verticalLabel}>历史记录</Text>
        </Pressable>
        <Pressable style={styles.verticalItem} onPress={openFavorites}>
          <Icon source="star" size={32} />
          <Text style={styles.verticalLabel}>我的收藏</Text>
        </Pressable>
        <Pressable style={styles.verticalItem} onPress={openWatchLater}>
          <Icon source="play-circle-outline" size={32} />
          <Text style={styles.verticalLabel}>稍后再看</Text>
        </Pressable>
      </Surface>

      {loggedIn ? (
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          退出登录
        </Button>
      ) : null}

      {loading ? (
        <Text style={styles.loadingText}>正在加载账号信息...</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    marginTop: 20,
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerSurface: {
    backgroundColor: "#f6f6f6",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 12,
    backgroundColor: "#eeeeee",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    paddingRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    marginRight: 6,
    color: "#111",
  },
  levelTag: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  levelText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  testText: {
    marginLeft: 6,
    color: "#666",
  },
  memberTag: {
    backgroundColor: "#ffe6f0",
    borderColor: "#ff6699",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  memberText: {
    color: "#ff6699",
    fontSize: 12,
  },
  coinRow: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
  },
  coinText: {
    color: "#666",
    fontSize: 14,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  loginDesc: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
  },
  surface: {
    // backgroundColor: "#f6f6f6",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    marginHorizontal: 16,
    borderRadius: 18,
    marginTop: 16,
  },
  loginHintSurface: {
    // backgroundColor: "#fff5f8",
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
  },
  loginHintTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  loginHintDesc: {
    fontSize: 13,
    color: "#777",
    marginTop: 8,
    lineHeight: 19,
  },
  loginHintButton: {
    marginTop: 14,
    borderRadius: 999,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  sectionTitleWrap: {
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  verticalSurface: {
    marginHorizontal: 16,
    borderRadius: 18,
    paddingVertical: 6,
    backgroundColor: "#f6f6f6",
    marginTop: 4,
  },
  verticalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  verticalLabel: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 999,
  },
  loadingText: {
    marginTop: 12,
    marginHorizontal: 16,
    color: "#888",
    fontSize: 12,
  },
});
