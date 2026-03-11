// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Category, AppScreenProps, Gesture } from "../types";
import { DataService } from "../services/DataService";
import { COLORS } from "../config/constants";
import { CategoryMenu } from "../components/CategoryMenu";
import { SearchBar } from "../components/SearchBar";
import { useAppStore } from "../store/appStore";
import { useAuth } from "../context/AuthContext";

type HomeScreenProps = AppScreenProps<"Home">;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { addRecent } = useAppStore();
  // ✅ Получаем user и logout из контекста
  const { user, logout } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setError(null);
      const data = await DataService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (item: Category) => {
    navigation.navigate("CategoryDetail", {
      categoryId: item.id,
      title: item.title,
    });
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCategorySelect(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.itemsCount !== undefined && (
          <Text style={styles.cardCount}>
            {t("category.videos_count", { count: item.itemsCount })}
          </Text>
        )}
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color="#999"
        style={styles.cardArrow}
      />
    </TouchableOpacity>
  );

  // ✅ Функция выхода вынесена отдельно
  const handleLogout = async () => {
    console.log("🚪 Начало выхода...");
    try {
      await logout(); // Вызываем функцию из контекста
      console.log("✅ Выход выполнен");

      // Небольшая задержка перед навигацией для надежности
      setTimeout(() => {
        navigation.navigate("Login");
      }, 100);
    } catch (err) {
      console.error("❌ Ошибка выхода:", err);
      Alert.alert("Ошибка", "Не удалось выйти из системы");
    }
  };

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
          <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
            <Text style={styles.retryText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const showCarousel = !isSearching && !isExpanded;
  const showActionButtonsInList = !isSearching && !isExpanded;
  const showHistoryAboveAccordion = !isSearching && isExpanded;
  const showAccordion = !isSearching;
  const showFavoritesInHeader = isSearching || isExpanded;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SearchBar
            onSelect={(gesture) => {
              addRecent(gesture);
              navigation.navigate("VideoPlayer", {
                videoUrl: gesture.videoURL,
                title: gesture.nameLink,
              });
            }}
            placeholder={t("home.search_placeholder")}
            isExpanded={isSearching}
            onExpandChange={setIsSearching}
          />
        </View>

        <View style={styles.headerRight}>
          {showFavoritesInHeader && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                if (!user) {
                  Alert.alert(
                    "Требуется авторизация",
                    "Для просмотра избранного необходимо войти в аккаунт",
                    [
                      { text: "Отмена", style: "cancel" },
                      {
                        text: "Войти",
                        onPress: () => navigation.navigate("Login"),
                      },
                    ],
                  );
                } else {
                  navigation.navigate("Favorites");
                }
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="heart" size={24} color="#dc3545" />
            </TouchableOpacity>
          )}

          {/* ✅ Кнопка профиля с исправленной логикой */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => {
              if (user) {
                Alert.alert("Профиль", `Вы вошли как: ${user.email}`, [
                  { text: "Отмена", style: "cancel" },
                  {
                    text: "Выйти",
                    style: "destructive",
                    onPress: handleLogout, // ✅ Используем нашу функцию
                  },
                ]);
              } else {
                Alert.alert("Профиль", "Вы не вошли в систему", [
                  { text: "Отмена", style: "cancel" },
                  {
                    text: "Войти",
                    onPress: () => navigation.navigate("Login"),
                  },
                  {
                    text: "Регистрация",
                    onPress: () => navigation.navigate("Register"),
                  },
                ]);
              }
            }}
          >
            <MaterialCommunityIcons
              name={user ? "account-circle" : "account-off-outline"}
              size={32}
              color={user ? COLORS.primary : "#999"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={isExpanded ? categories : []}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {showCarousel && (
              <View style={styles.carouselSection}>
                <CategoryMenu
                  items={categories}
                  onSelect={handleCategorySelect}
                  viewMode="carousel"
                />
              </View>
            )}

            {showActionButtonsInList && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    if (!user) {
                      Alert.alert(
                        "Требуется авторизация",
                        "Для просмотра избранного необходимо войти в аккаунт",
                        [
                          { text: "Отмена", style: "cancel" },
                          {
                            text: "Войти",
                            onPress: () => navigation.navigate("Login"),
                          },
                        ],
                      );
                    } else {
                      navigation.navigate("Favorites");
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="heart"
                    size={24}
                    color="#dc3545"
                  />
                  <Text style={[styles.actionButtonText, { color: "#dc3545" }]}>
                    {t("favorites.title")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    if (!user) {
                      Alert.alert(
                        "Требуется авторизация",
                        "Для просмотра истории необходимо войти в аккаунт",
                        [
                          { text: "Отмена", style: "cancel" },
                          {
                            text: "Войти",
                            onPress: () => navigation.navigate("Login"),
                          },
                        ],
                      );
                    } else {
                      navigation.navigate("History");
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="history"
                    size={24}
                    color="#2196F3"
                  />
                  <Text style={[styles.actionButtonText, { color: "#2196F3" }]}>
                    {t("history.title")}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {showHistoryAboveAccordion && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (!user) {
                    Alert.alert(
                      "Требуется авторизация",
                      "Для просмотра истории необходимо войти в аккаунт",
                      [
                        { text: "Отмена", style: "cancel" },
                        {
                          text: "Войти",
                          onPress: () => navigation.navigate("Login"),
                        },
                      ],
                    );
                  } else {
                    navigation.navigate("History");
                  }
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="history"
                  size={24}
                  color="#2196F3"
                />
                <Text style={[styles.actionButtonText, { color: "#2196F3" }]}>
                  {t("history.title")}
                </Text>
              </TouchableOpacity>
            )}

            {showAccordion && (
              <TouchableOpacity
                style={styles.accordionButton}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.5}
              >
                <View style={styles.accordionContent}>
                  <Text style={styles.accordionText}>
                    {isExpanded
                      ? t("home.hide_all")
                      : t("home.show_all_categories")}
                  </Text>
                  <MaterialCommunityIcons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
              </TouchableOpacity>
            )}

            {!isSearching && !isExpanded && <View style={styles.divider} />}
          </>
        }
        ListEmptyComponent={
          !isSearching && !isExpanded ? (
            <View style={styles.emptyCarousel}>
              <Text style={styles.emptyText}>{t("home.carousel_hint")}</Text>
            </View>
          ) : null
        }
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    gap: 8,
  },
  headerLeft: { flex: 1 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  profileButton: { padding: 4 },
  list: { paddingBottom: 24 },
  carouselSection: { marginBottom: 16 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    paddingVertical: 14,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  accordionButton: {
    backgroundColor: "#F8F9FA",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  accordionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  accordionText: { fontSize: 16, fontWeight: "600", color: COLORS.primary },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  cardContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardCount: { fontSize: 13, color: "#666" },
  cardArrow: { marginRight: 4 },
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
  emptyCarousel: { padding: 32, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#666", textAlign: "center" },
});
