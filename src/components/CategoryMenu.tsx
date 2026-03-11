// src/components/CategoryMenu.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  LayoutChangeEvent,
} from "react-native";
import { Category } from "../types";
import { COLORS } from "../config/constants";

const SPACING = 12; // Отступ между карточками
const CARD_PERCENT = 0.95; // 95% ширины

interface CategoryMenuProps {
  items: Category[];
  onSelect: (item: Category) => void;
  viewMode: "carousel" | "list";
}

export const CategoryMenu: React.FC<CategoryMenuProps> = ({
  items,
  onSelect,
  viewMode,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // ✅ Получаем реальную ширину контейнера
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // ✅ Вычисляем ширину карточки на основе контейнера
  const CARD_WIDTH = containerWidth > 0 ? containerWidth * CARD_PERCENT : 0;
  // ✅ Точный интервал снаппинга
  const SNAP_INTERVAL = CARD_WIDTH + SPACING;

  const renderMenuItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.menuCard,
        { width: CARD_WIDTH },
        viewMode === "list" && styles.menuCardList,
      ]}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image }}
        style={[
          styles.menuImage,
          { width: CARD_WIDTH - 40, height: CARD_WIDTH - 40 },
          viewMode === "list" && styles.menuImageList,
        ]}
        resizeMode="contain"
        onError={() => console.warn("Image load error:", item.image)}
      />
      <Text
        style={[styles.menuTitle, viewMode === "list" && styles.menuTitleList]}
        numberOfLines={2}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  if (viewMode === "list") {
    return (
      <View style={styles.listContainer}>
        {items.map((item, index) => (
          <View key={`${item.id}-${index}`} style={styles.listItemWrapper}>
            {renderMenuItem({ item })}
          </View>
        ))}
      </View>
    );
  }

  // ✅ Вычисляем отступ для центрирования
  const centerOffset =
    containerWidth > 0 ? (containerWidth - CARD_WIDTH) / 2 : 0;

  return (
    <View onLayout={handleLayout} style={styles.carouselWrapper}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: centerOffset,
          paddingRight: centerOffset,
          paddingVertical: 10,
        }}
        // ✅ Отключаем snapToInterval — используем ручное управление
        snapToInterval={undefined}
        snapToAlignment="center"
        decelerationRate="fast"
        // ✅ Ручная подгонка позиции после скролла
        onMomentumScrollEnd={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;
          const index = Math.round(offsetX / SNAP_INTERVAL);
          const targetX = index * SNAP_INTERVAL;

          // Подгоняем к ближайшей карточке
          if (Math.abs(offsetX - targetX) > 1) {
            scrollViewRef.current?.scrollTo({
              x: targetX,
              animated: true,
            });
          }
        }}
      >
        {items.map((item, index) => (
          <View
            key={`${item.id}-${index}`}
            style={{ marginRight: index < items.length - 1 ? SPACING : 0 }}
          >
            {renderMenuItem({ item })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselWrapper: {
    width: "100%",
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  listItemWrapper: {
    width: "33.33%",
    padding: 4,
  },
  menuCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuCardList: {
    width: "100%",
    padding: 12,
  },
  menuImage: {
    borderRadius: 8,
  },
  menuImageList: {
    width: "100%",
    aspectRatio: 1,
  },
  menuTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: COLORS.text,
  },
  menuTitleList: {
    fontSize: 12,
  },
});
