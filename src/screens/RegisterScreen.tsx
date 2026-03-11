// src/screens/RegisterScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../config/constants";

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ ОДНО состояние для обоих полей пароля
  const [showPasswords, setShowPasswords] = useState(false);

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Ошибка", "Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Ошибка", "Пароль должен быть не менее 6 символов");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
      navigation.replace("Home");
    } catch (e: any) {
      console.error("Registration error:", e);
      if (e.message?.includes("UNIQUE constraint failed")) {
        Alert.alert(
          "Ошибка",
          "Такой email уже зарегистрирован. Попробуйте войти.",
        );
      } else {
        Alert.alert("Ошибка", e.message || "Не удалось зарегистрироваться");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>
            Создайте аккаунт для сохранения истории
          </Text>

          {/* Имя */}
          <TextInput
            style={styles.input}
            placeholder="Ваше имя"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          {/* Email */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          {/* Пароль с глазом (управляет обоими полями) */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPasswords}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPasswords(!showPasswords)}
              style={styles.eyeIcon}
              disabled={loading}
            >
              <MaterialCommunityIcons
                name={showPasswords ? "eye-off" : "eye"}
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Подтверждение пароля (без глаза, зависит от showPasswords) */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPasswords}
              editable={!loading}
            />
            {/* Пустой блок справа для выравнивания, так как глаза тут нет */}
            <View style={styles.emptySpace} />
          </View>

          {/* Кнопка регистрации */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Зарегистрироваться</Text>
            )}
          </TouchableOpacity>

          {/* Ссылка на вход */}
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate("Login")}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              Уже есть аккаунт? <Text style={styles.boldText}>Войти</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: "center" },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },

  // Контейнер для пароля
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  passwordInput: { flex: 1, padding: 16, fontSize: 16 },
  eyeIcon: { padding: 12, marginRight: 4 },
  emptySpace: { width: 44 }, // Пустое место вместо иконки для выравнивания ширины

  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linkContainer: { alignItems: "center", marginTop: 20 },
  linkText: { fontSize: 15, color: "#666" },
  boldText: { fontWeight: "700", color: COLORS.primary },
});
