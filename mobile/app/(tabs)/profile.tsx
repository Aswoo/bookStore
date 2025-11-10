import { useCallback, useEffect, useState } from "react";
import {
  View,
  Alert,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import type { ListRenderItem } from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Image } from "expo-image";
import { sleep } from ".";
import Loader from "../../components/Loader";
import type { Book, ErrorResponse } from "../../types/api";

export default function Profile(): JSX.Element {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);

  const { token } = useAuthStore();

  const router = useRouter();

  const fetchData = useCallback(async (): Promise<void> => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/books/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (await response.json()) as Book[] | ErrorResponse;
      if (!response.ok) {
        throw new Error((data as ErrorResponse).message || "Failed to fetch user books");
      }

      setBooks(data as Book[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load profile data. Pull down to refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleDeleteBook = useCallback(
    async (bookId: string): Promise<void> => {
      if (!token) return;

    try {
      setDeleteBookId(bookId);

      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (await response.json()) as ErrorResponse;
      if (!response.ok) throw new Error(data.message || "Failed to delete book");

      setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));
      Alert.alert("Success", "Recommendation deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete recommendation";
      Alert.alert("Error", message);
    } finally {
      setDeleteBookId(null);
    }
    },
    [token]
  );

  const confirmDelete = useCallback(
    (bookId: string): void => {
      Alert.alert("Delete Recommendation", "Are you sure you want to delete this recommendation?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void handleDeleteBook(bookId) },
      ]);
    },
    [handleDeleteBook]
  );

  const renderRatingStars = (rating: number): JSX.Element[] => {
    const stars: JSX.Element[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderBookItem: ListRenderItem<Book> = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.image }} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.bookCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <Text style={styles.bookDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
        {deleteBookId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await sleep(500);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  if (isLoading && !refreshing) return <Loader />;

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      {/* YOUR RECOMMENDATIONS */}
      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>내 추천 도서 📚</Text>
        <Text style={styles.booksCount}>{books.length}권</Text>
      </View>

      <FlatList<Book>
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={50} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>아직 추천된 책이 없어요</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
              <Text style={styles.addButtonText}>첫 번째 책을 추가해 보세요</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
