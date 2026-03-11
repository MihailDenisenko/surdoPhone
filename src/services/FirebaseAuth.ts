// src/services/FirebaseAuth.ts
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";

// ⚠️ ЗАМЕНИ ЭТОТ ID на свой из консоли Firebase!
// Project Settings -> General -> Your apps -> Web SDK configuration -> Web client ID
const WEB_CLIENT_ID =
  "157313443933-cg4bhscmg99i5qddmk24f3efanjne7ev.apps.googleusercontent.com";

if (!WEB_CLIENT_ID || WEB_CLIENT_ID.includes("ТВОЙ_")) {
  console.warn(
    "⚠️ WARNING: Web Client ID не настроен в FirebaseAuth.ts! Вход через Google не сработает.",
  );
}

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export const AuthService = {
  async signInWithGoogle() {
    try {
      // 1. Проверяем наличие сервисов Google Play (для Android)
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // 2. Запускаем процесс входа
      const userInfo = await GoogleSignin.signIn();

      // 3. Извлекаем ID Token с правильной проверкой типов
      // В новых версиях данные лежат в userInfo.data
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error("Не удалось получить ID токен от Google");
      }

      // 4. Создаем учетные данные Firebase
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // 5. Входим в Firebase
      const userCredential =
        await auth().signInWithCredential(googleCredential);

      return userCredential.user;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("🚫 Пользователь отменил вход");
        return null;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("⏳ Вход уже в процессе");
        return null;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("❌ Сервисы Google Play недоступны");
        throw new Error("Сервисы Google Play недоступны или устарели");
      } else {
        console.error("❌ Ошибка входа Google:", error);
        throw new Error(error.message || "Не удалось войти через Google");
      }
    }
  },

  async signOut() {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  },

  getCurrentUser() {
    return auth().currentUser;
  },

  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return auth().onAuthStateChanged(callback);
  },
};
