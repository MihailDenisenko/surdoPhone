// src/screens/CategoryDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, AppScreenProps } from "../types";
import { DataService } from "../services/DataService";
import { COLORS } from "../config/constants";

type CategoryDetailScreenProps = AppScreenProps<"CategoryDetail">;

export const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();
  const { categoryId, title } = route.params;
  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("📺 CategoryDetailScreen загружается");
    console.log("📺 categoryId:", categoryId);
    console.log("📺 title:", title);
    loadGestures();
  }, [categoryId]);

  const loadGestures = async () => {
    try {
      setError(null);
      console.log("🔍 Загрузка жестов для categoryId:", categoryId);

      // ✅ Передаём categoryId (не dataLink!)
      const data = await DataService.getGesturesByCategory(categoryId);

      console.log("✅ Жесты загружены:", data.length);
      setGestures(data);
    } catch (err) {
      console.error("❌ Ошибка загрузки жестов:", err);
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPress = (gesture: Gesture) => {
    console.log("▶️ Выбор жеста:", gesture.nameLink);
    console.log("▶️ videoURL:", gesture.videoURL);

    navigation.navigate("VideoPlayer", {
      videoUrl: gesture.videoURL,
      title: gesture.nameLink,
    });
  };

  const renderGesture = ({ item, index }: { item: Gesture; index: number }) => (
    <TouchableOpacity
      style={styles.gestureCard}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.gestureNumber}>
        <Text style={styles.numberText}>{index + 1}</Text>
      </View>
      <View style={styles.gestureContent}>
        <Text style={styles.gestureTitle} numberOfLines={2}>
          {item.nameLink}
        </Text>
        <View style={styles.playIndicator}>
          <MaterialCommunityIcons
            name="play-circle-outline"
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.playText}>{t("category.watch_video")}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="video-off-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>{t("category.no_videos")}</Text>
      {/* ✅ Отладочная информация */}
      <Text style={styles.debugText}>categoryId: {categoryId}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadGestures}>
            <Text style={styles.retryText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={gestures}
        renderItem={renderGesture}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, paddingBottom: 24 },
  gestureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  gestureNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  gestureContent: { flex: 1 },
  gestureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  playIndicator: { flexDirection: "row", alignItems: "center", gap: 6 },
  playText: { fontSize: 13, color: COLORS.primary, fontWeight: "500" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#666" },
  errorText: {
    fontSize: 15,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  empty: { padding: 48, alignItems: "center" },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
  debugText: { fontSize: 12, color: "#999", marginTop: 8 },
});
