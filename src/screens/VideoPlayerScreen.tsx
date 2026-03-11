// src/screens/VideoPlayerScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

import { AppScreenProps, Gesture } from "../types";
import { COLORS } from "../config/constants";
import { useAppStore } from "../store/appStore";
import { useAuth } from "../context/AuthContext";

type VideoPlayerScreenProps = AppScreenProps<"VideoPlayer">;

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();
  const { videoUrl, title } = route.params;
  const videoRef = useRef<Video>(null);

  const { favorites, addFavorite, removeFavorite, isFavorite, addRecent } =
    useAppStore();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const currentGesture: Gesture = {
    id: title,
    nameLink: title,
    videoURL: videoUrl,
  };

  const isInFavorites = isFavorite(currentGesture.id);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setIsPlaying(false);

    if (user) {
      addRecent(currentGesture);
    }

    const timer = setTimeout(() => {
      videoRef.current
        ?.playAsync()
        .catch((e) => console.warn("Auto-play error:", e));
    }, 500);

    return () => clearTimeout(timer);
  }, [videoUrl]);

  const handleStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    if (playbackStatus.isLoaded) {
      setLoading(false);
      if ("isPlaying" in playbackStatus) {
        setIsPlaying(playbackStatus.isPlaying);
      }
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!status?.isLoaded) return;
      if (isPlaying) {
        await videoRef.current?.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current?.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      Alert.alert(t("common.error"), t("video.playback_error"));
    }
  };

  const handleReplay = async () => {
    try {
      await videoRef.current?.replayAsync();
      setIsPlaying(true);
    } catch (err) {
      console.error("Replay error:", err);
    }
  };

  const handleToggleFavorite = () => {
    if (!user) {
      Alert.alert(
        "Требуется авторизация",
        "Для добавления в избранное необходимо войти в аккаунт",
        [
          { text: "Отмена", style: "cancel" },
          { text: "Войти", onPress: () => navigation.navigate("Login") },
        ],
      );
      return;
    }

    if (isInFavorites) {
      removeFavorite(currentGesture.id);
    } else {
      addFavorite(currentGesture);
      Alert.alert("Успех", "Добавлено в избранное");
    }
  };

  // ✅ Исправленная функция скачивания
  const handleDownload = async () => {
    try {
      setDownloading(true);

      // 1. Запрос прав на доступ к медиа
      const { status: mediaStatus } =
        await MediaLibrary.requestPermissionsAsync();

      if (mediaStatus !== "granted") {
        Alert.alert(
          "Ошибка",
          "Нет доступа к галерее. Разрешите доступ в настройках.",
        );
        setDownloading(false);
        return;
      }

      // 2. ✅ Исправление: используем cacheDirectory как основной вариант
      const fs = FileSystem as any;

      // Пробуем несколько вариантов получения пути
      const basePath =
        fs.cacheDirectory || fs.documentDirectory || fs.externalCacheDirectory;

      console.log("📁 Путь к хранилищу:", basePath);

      if (!basePath) {
        throw new Error(
          "Файловая система недоступна. Попробуйте запустить в APK, а не в Expo Go.",
        );
      }

      const cleanTitle = title.replace(/[^a-zа-я0-9]/gi, "_").substring(0, 30);
      const fileName = `${cleanTitle}_${Date.now()}.mp4`;
      const fileUri = basePath + fileName;

      console.log("📥 Путь для сохранения:", fileUri);

      // 3. Скачиваем с заголовками браузера
      const downloadOptions: any = {
        httpHeaders: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "*/*",
          Connection: "keep-alive",
        },
      };

      const downloadResumable = FileSystem.createDownloadResumable(
        videoUrl,
        fileUri,
        downloadOptions,
      );

      const { uri } = await downloadResumable.downloadAsync();
      console.log("✅ Файл скачан:", uri);

      // 4. Сохраняем в галерею
      const asset = await MediaLibrary.createAssetAsync(uri);

      if (Platform.OS === "ios") {
        const album = await MediaLibrary.getAlbumAsync("Surdo.Media");
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync("Surdo.Media", asset, false);
        }
      }

      Alert.alert("Успех!", "Видео сохранено в галерею");
    } catch (err: any) {
      console.error("❌ Ошибка скачивания:", err);

      let message = "Не удалось скачать видео";
      if (err.message?.includes("Файловая система")) {
        message =
          "Expo Go не поддерживает скачивание файлов. Пожалуйста, установите APK версию приложения.";
      } else if (err.message?.includes("Network")) {
        message = "Ошибка сети. Проверьте интернет-соединение.";
      } else if (
        err.message?.includes("permission") ||
        err.message?.includes("Permission")
      ) {
        message =
          "Нет разрешения на доступ к галерее. Проверьте настройки приложения.";
      }

      Alert.alert("Ошибка", message);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      const fileName = `surdo_${Date.now()}.mp4`;

      const fs = FileSystem as any;
      const basePath = fs.cacheDirectory || fs.documentDirectory;
      if (!basePath) throw new Error("Не удалось получить путь к кэшу");

      const fileUri = basePath + fileName;

      const downloadResumable = FileSystem.createDownloadResumable(
        videoUrl,
        fileUri,
      );
      const { uri } = await downloadResumable.downloadAsync();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "video/mp4" });
      }
    } catch (err: any) {
      Alert.alert("Ошибка", err.message || "Не удалось поделиться");
    }
  };

  const handleError = (error: any) => {
    setLoading(false);
    setError("Ошибка загрузки видео");
  };

  const formatTime = (millis: number) => {
    if (!millis) return "0:00";
    const seconds = Math.floor(millis / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, !showControls && styles.headerHidden]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <MaterialCommunityIcons
              name={isInFavorites ? "heart" : "heart-outline"}
              size={24}
              color={isInFavorites ? "#dc3545" : COLORS.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownload} disabled={downloading}>
            {downloading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <MaterialCommunityIcons
                name="download"
                size={24}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.videoContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        <TouchableOpacity
          style={styles.videoWrapper}
          onPress={() => setShowControls(!showControls)}
        >
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: videoUrl }}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={handleStatusUpdate}
            onError={handleError}
            shouldPlay={true}
          />
        </TouchableOpacity>

        {status?.isLoaded && !loading && showControls && (
          <View style={styles.controlsOverlay}>
            <View style={styles.controls}>
              <TouchableOpacity onPress={handleReplay}>
                <MaterialCommunityIcons name="replay" size={32} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePlayPause}>
                <MaterialCommunityIcons
                  name={isPlaying ? "pause-circle" : "play-circle"}
                  size={56}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare}>
                <MaterialCommunityIcons
                  name="share-variant"
                  size={32}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>
                {formatTime(status.positionMillis || 0)}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${((status.positionMillis || 0) / (status.durationMillis || 1)) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.timeText}>
                {formatTime(status.durationMillis || 0)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <TouchableOpacity
          style={[
            styles.favoriteButtonLarge,
            isInFavorites && styles.favoriteButtonActive,
          ]}
          onPress={handleToggleFavorite}
        >
          <Text
            style={[
              styles.favoriteButtonText,
              isInFavorites && styles.favoriteButtonTextActive,
            ]}
          >
            {isInFavorites ? "В избранном" : "Добавить в избранное"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerHidden: { opacity: 0 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerActions: { flexDirection: "row", gap: 16 },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  videoWrapper: { width: "100%", height: "100%" },
  video: { width: "100%", height: "100%" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  controlsOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingBottom: 20,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 2 },
  timeText: { color: "#fff", fontSize: 12, width: 40 },
  infoContainer: { padding: 20, borderTopWidth: 1, borderColor: "#eee" },
  favoriteButtonLarge: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#dc3545",
    alignItems: "center",
  },
  favoriteButtonActive: { backgroundColor: "#dc3545" },
  favoriteButtonText: { color: "#dc3545", fontWeight: "bold", fontSize: 16 },
  favoriteButtonTextActive: { color: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", marginBottom: 20 },
  retryText: { color: "blue", fontWeight: "bold" },
});
