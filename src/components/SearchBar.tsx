// src/components/SearchBar.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Animated,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { Gesture } from "../types";
import { COLORS } from "../config/constants";
import { useAppStore } from "../store/appStore";
import { SearchService } from "../services/SearchService";

interface SearchBarProps {
  onSelect: (gesture: Gesture) => void;
  // onToggleFavorites: () => void;
  placeholder?: string;
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelect,
  placeholder,
  isExpanded,
  onExpandChange,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Gesture[]>([]);

  const { searchHistory, addSearchHistory, recent, addRecent } = useAppStore();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 1) {
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        await performSearch(query);
      }, 300);
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      const results = await SearchService.search(searchQuery, 50);
      setResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ - без Keyboard.dismiss()
  const handleSelect = (gesture: Gesture) => {
    console.log("🔍 Выбор жеста:", gesture.nameLink);

    addSearchHistory(query);
    addRecent(gesture);

    // ✅ СРАЗУ вызываем навигацию
    onSelect(gesture);

    // ✅ Очищаем состояние
    setQuery("");
    setShowResults(false);
    onExpandChange(false);

    // ✅ НЕ вызываем Keyboard.dismiss() - навигация закроет сама!
  };

  const handleClear = () => {
    if (query.length > 0) {
      setQuery("");
      setResults([]);
      setShowResults(false);
    } else {
      onExpandChange(false);
    }
  };

  const handleHistorySelect = (historyQuery: string) => {
    setQuery(historyQuery);
    setShowResults(true);
  };

  const showHistory =
    query.trim().length === 0 && searchHistory.length > 0 && isExpanded;
  const showRecent =
    query.trim().length === 0 &&
    recent.length > 0 &&
    !showHistory &&
    isExpanded;

  // Если не развернуто - показываем только лупу
  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.searchButtonCollapsed}
        onPress={() => onExpandChange(true)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="magnify" size={24} color={COLORS.text} />
      </TouchableOpacity>
    );
  }

  // Развернутый поиск
  return (
    <Animated.View style={[styles.containerExpanded, { opacity: fadeAnim }]}>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={24}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder || t("home.search_placeholder")}
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setShowResults(true)}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <MaterialCommunityIcons name="close-circle" size={24} color="#999" />
        </TouchableOpacity>
        {loading && (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loader}
          />
        )}
      </View>

      {showResults && (
        <View style={styles.dropdown}>
          {query.trim().length >= 1 && results.length > 0 && (
            <>
              <Text style={styles.dropdownTitle}>
                {t("search.results", { count: results.length })}
              </Text>
              {/* ✅ ДОБАВЛЕНО: keyboardShouldPersistTaps="handled" */}
              <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                    // ✅ Важно для Android
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialCommunityIcons
                      name="video"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.resultText} numberOfLines={2}>
                      {item.nameLink}
                      {item.categoryName && (
                        <Text style={styles.categoryBadge}>
                          {" "}
                          • {item.categoryName}
                        </Text>
                      )}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.resultsList}
                // ✅ ГЛАВНОЕ ИСПРАВЛЕНИЕ - позволяет тапам работать при открытой клавиатуре
                keyboardShouldPersistTaps="handled"
              />
            </>
          )}

          {showHistory && (
            <>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>{t("search.history")}</Text>
                <TouchableOpacity
                  onPress={() => useAppStore.getState().clearSearchHistory()}
                >
                  <Text style={styles.clearHistory}>
                    {t("search.clear_history")}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={searchHistory}
                keyExtractor={(item, index) => `history-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.historyItem}
                    onPress={() => handleHistorySelect(item)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="history"
                      size={20}
                      color="#999"
                    />
                    <Text style={styles.historyText} numberOfLines={1}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.resultsList}
                // ✅ Тоже добавляем для истории
                keyboardShouldPersistTaps="handled"
              />
            </>
          )}

          {showRecent && (
            <>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>{t("search.recent")}</Text>
                <TouchableOpacity
                  onPress={() => useAppStore.getState().clearRecent()}
                >
                  <Text style={styles.clearHistory}>
                    {t("search.clear_recent")}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={recent}
                keyExtractor={(item) => `recent-${item.id}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.historyItem}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={20}
                      color="#999"
                    />
                    <Text style={styles.historyText} numberOfLines={1}>
                      {item.nameLink}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.resultsList}
                // ✅ Тоже добавляем для недавних
                keyboardShouldPersistTaps="handled"
              />
            </>
          )}

          {query.trim().length >= 1 && results.length === 0 && !loading && (
            <View style={styles.emptyResults}>
              <MaterialCommunityIcons
                name="magnify-remove-outline"
                size={40}
                color="#ccc"
              />
              <Text style={styles.emptyText}>{t("search.no_results")}</Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  searchButtonCollapsed: {
    padding: 8,
    borderRadius: 8,
  },
  containerExpanded: {
    position: "relative",
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, height: 44, fontSize: 16, color: COLORS.text },
  clearButton: { padding: 4 },
  loader: { marginLeft: 8 },
  dropdown: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 300,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
  },
  clearHistory: { fontSize: 13, color: COLORS.primary, fontWeight: "500" },
  resultsList: { maxHeight: 200 },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  resultText: { flex: 1, fontSize: 15, color: COLORS.text, marginLeft: 12 },
  categoryBadge: { fontSize: 13, color: "#999", marginLeft: 4 },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  historyText: { flex: 1, fontSize: 15, color: COLORS.text, marginLeft: 12 },
  emptyResults: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#999", textAlign: "center", marginTop: 8 },
});
