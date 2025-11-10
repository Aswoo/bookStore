import { Text, TouchableOpacity, Alert } from "react-native";
import { ReactElement, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import styles from "../assets/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

export default function LogoutButton(): ReactElement {
  const { logout } = useAuthStore();

  const confirmLogout = useCallback(() => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        onPress: () => {
          void logout();
        },
        style: "destructive",
      },
    ]);
  }, [logout]);

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
      <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
      <Text style={styles.logoutText}>로그아웃</Text>
    </TouchableOpacity>
  );
}
