import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";

export default function WebSocketScreen() {
  // 你的用户ID
  const userId = "10086";
  const [ws, setWs] = useState(null);
  const [msgList, setMsgList] = useState([]);

  useEffect(() => {
    // ✅ 这是你正确的地址
    const socket = new WebSocket("ws://10.187.115.133:8080/ws/" + userId);

    // 连接成功
    socket.onopen = () => {
      console.log("✅ WebSocket 连接成功！");
    };

    // 收到消息
    socket.onmessage = (event) => {
      console.log("收到消息：", event.data);
      setMsgList((prev) => [...prev, event.data]);
    };

    // 关闭
    socket.onclose = () => {
      console.log("❌ 连接关闭");
    };

    // 错误
    socket.onerror = (err) => {
      console.log("⚠️ 错误：", err);
    };

    setWs(socket);

    return () => socket.close();
  }, [userId]);

  const sendTest = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("RN 发送消息");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>消息中心</Text>

      <FlatList
        data={msgList}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item}</Text>
          </View>
        )}
      />

      <Button title="发送测试" onPress={sendTest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },
});
