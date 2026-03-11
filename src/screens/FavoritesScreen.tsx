// src/screens/FavoritesScreen.tsx
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

type FavoritesScreenProps = AppScreenProps<"Favorites">;

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { favorites, removeFavorite } = useAppStore();
  const { user } = useAuth();

  useEffect(() => {
    // ✅ Проверка авторизации при открытии экрана
    if (!user) {
      Alert.alert(
        "Требуется авторизация",
        "Для просмотра избранного необходимо войти в аккаунт",
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

  const handleRemove = (gesture: Gesture) => {
    removeFavorite(gesture.id);
  };

  const renderFavorite = ({ item }: { item: Gesture }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <MaterialCommunityIcons name="video" size={24} color={COLORS.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.nameLink}
          </Text>
          {item.categoryName && (
            <Text style={styles.category}>{item.categoryName}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item)}
      >
        <MaterialCommunityIcons name="heart-off" size={24} color="#dc3545" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="heart-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>{t("favorites.empty")}</Text>
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
          <Text style={styles.headerTitle}>{t("favorites.title")}</Text>
          <View style={{ width: 24 }} />
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
        <Text style={styles.headerTitle}>{t("favorites.title")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavorite}
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
  list: { padding: 16, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardContent: { flex: 1, flexDirection: "row", alignItems: "center" },
  textContainer: { marginLeft: 12, flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  category: { fontSize: 13, color: "#999" },
  removeButton: { padding: 8 },
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
