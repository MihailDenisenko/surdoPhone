// src/screens/HistoryScreen.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, AppScreenProps } from "../types";
import { COLORS } from "../config/constants";
import { useAppStore } from "../store/appStore";
import { useAuth } from "../context/AuthContext";

type HistoryScreenProps = AppScreenProps<"History">;

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { recent, clearRecent } = useAppStore();
  const { user } = useAuth();

  useEffect(() => {
    // ✅ Проверка авторизации при открытии экрана
    if (!user) {
      Alert.alert(
        "Требуется авторизация",
        "Для просмотра истории необходимо войти в аккаунт",
        [
          {
            text: "Отмена",
            style: "cancel",
            onPress: () => navigation.goBack(),
          },
          {
            text: "Войти",
            onPress: () => navigation.navigate("Login"),
          },
        ],
      );
    }
  }, [user]);

  const handleVideoPress = (gesture: Gesture) => {
    navigation.navigate("VideoPlayer", {
      videoUrl: gesture.videoURL,
      title: gesture.nameLink,
    });
  };

  const renderHistoryItem = ({
    item,
    index,
  }: {
    item: Gesture;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.indexContainer}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>
      <View style={styles.cardContent}>
        <MaterialCommunityIcons
          name="play-circle"
          size={24}
          color={COLORS.primary}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.nameLink}
          </Text>
          {item.categoryName && (
            <Text style={styles.category}>{item.categoryName}</Text>
          )}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="history" size={64} color="#ccc" />
      <Text style={styles.emptyText}>{t("history.empty")}</Text>
    </View>
  );

  // Если не авторизован — показываем пустой экран
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("history.title")}</Text>
          <TouchableOpacity
            onPress={clearRecent}
            disabled={recent.length === 0 || !user}
          >
            <Text
              style={[
                styles.clearButton,
                (!user || recent.length === 0) && styles.clearButtonDisabled,
              ]}
            >
              {t("history.clear")}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.empty}>
          <MaterialCommunityIcons name="lock-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Требуется авторизация</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Войти</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("history.title")}</Text>
        <TouchableOpacity onPress={clearRecent} disabled={recent.length === 0}>
          <Text
            style={[
              styles.clearButton,
              recent.length === 0 && styles.clearButtonDisabled,
            ]}
          >
            {t("history.clear")}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recent}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => `history-${item.id}-${Date.now()}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  clearButton: { fontSize: 14, fontWeight: "600", color: "#dc3545" },
  clearButtonDisabled: { color: "#ccc" },
  list: { padding: 16, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  indexContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  indexText: { fontSize: 14, fontWeight: "700", color: "#666" },
  cardContent: { flex: 1, flexDirection: "row", alignItems: "center" },
  textContainer: { marginLeft: 12, flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  category: { fontSize: 12, color: "#999" },
  empty: { padding: 48, alignItems: "center" },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
