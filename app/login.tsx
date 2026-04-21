import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { Button, Snackbar, Text } from "react-native-paper";

import { fetchCaptcha, login } from "@/lib/api";
import { saveAuthSession, toAuthSession } from "@/lib/auth";

export default function LoginScreen() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotice = useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const loadCaptcha = useCallback(async () => {
    try {
      setCaptchaLoading(true);
      setErrorMessage("");
      const captcha = await fetchCaptcha();
      setCaptchaId(captcha.captchaId);
      setCaptchaImage(captcha.imageBase64);
      setCaptchaCode("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "验证码加载失败";
      setErrorMessage(message);
      showNotice(message);
    } finally {
      setCaptchaLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    void loadCaptcha();
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [loadCaptcha]);

  const handleLogin = async () => {
    if (!account.trim() || !password.trim() || !captchaCode.trim()) {
      const message = "请把账号、密码和验证码填写完整";
      setErrorMessage(message);
      showNotice(message);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const response = await login({
        account: account.trim(),
        password,
        captchaId,
        captchaCode: captchaCode.trim(),
      });
      await saveAuthSession(toAuthSession(response));
      showNotice("登录成功，正在进入个人中心...");
      redirectTimerRef.current = setTimeout(() => {
        router.replace("/(tabs)/me");
      }, 600);
    } catch (error) {
      const message = error instanceof Error ? error.message : "登录失败";
      setErrorMessage(message);
      showNotice(message);
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.brand}>MyAntApp</Text>
          <Text style={styles.title}>欢迎回来</Text>
          <Text style={styles.subtitle}>
            登录后即可同步你的收藏、历史和关注内容
          </Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="手机号 / 邮箱 / 用户名"
            value={account}
            onChangeText={setAccount}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <View style={styles.captchaRow}>
            <TextInput
              style={[styles.input, styles.captchaInput]}
              placeholder="验证码"
              value={captchaCode}
              onChangeText={setCaptchaCode}
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            <Pressable style={styles.captchaBox} onPress={loadCaptcha}>
              {captchaLoading ? (
                <Text style={styles.captchaText}>加载中...</Text>
              ) : captchaImage ? (
                <Image
                  source={{ uri: captchaImage }}
                  style={styles.captchaImage}
                />
              ) : (
                <Text style={styles.captchaText}>点击刷新验证码</Text>
              )}
            </Pressable>
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            登录
          </Button>

          <View style={styles.linksRow}>
            <Pressable onPress={() => router.push("/register")}>
              <Text style={styles.linkText}>注册账号</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/forgot-password")}>
              <Text style={styles.linkText}>忘记密码</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1800}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 36,
  },
  hero: {
    marginBottom: 28,
  },
  brand: {
    fontSize: 14,
    color: "#ff6699",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#777",
  },
  card: {
    backgroundColor: "#fafafa",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  input: {
    width: "100%",
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    color: "#111",
  },
  captchaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  captchaInput: {
    flex: 1,
    marginTop: 0,
  },
  captchaBox: {
    width: 116,
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  captchaImage: {
    width: "100%",
    height: "100%",
  },
  captchaText: {
    fontSize: 12,
    color: "#888",
  },
  errorText: {
    color: "#d93025",
    fontSize: 13,
    marginTop: 12,
  },
  button: {
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: "#ff6699",
  },
  buttonContent: {
    height: 50,
  },
  linksRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  linkText: {
    color: "#ff6699",
    fontSize: 14,
    fontWeight: "600",
  },
  snackbar: {
    backgroundColor: "#111",
  },
});
