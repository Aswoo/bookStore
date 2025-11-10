import { View, Text } from "react-native";
import { ReactElement } from "react";
import { useAuthStore } from "../store/authStore";
import { Image } from "expo-image";
import styles from "../assets/styles/profile.styles";
import { formatMemberSince } from "../lib/utils";

export default function ProfileHeader(): ReactElement | null {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <View style={styles.profileHeader}>
      <Image source={{ uri: user.profileImage }} style={styles.profileImage} />

      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.memberSince}>🗓️ 가입일 {formatMemberSince(user.createdAt)}</Text>
      </View>
    </View>
  );
}
