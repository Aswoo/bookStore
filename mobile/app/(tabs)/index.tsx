import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import type { ListRenderItem } from "react-native";
import { useAuthStore } from "../../store/authStore";

import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";

import styles from "../../assets/styles/home.styles";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate } from "../../lib/utils";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import type { Book, PaginatedBooksResponse, ErrorResponse } from "../../types/api";

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default function Home(): JSX.Element {
  const { token } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchBooks = useCallback(
    async (pageNum = 1, refresh = false): Promise<void> => {
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (refresh) setRefreshing(true);
        else if (pageNum === 1) setLoading(true);

        const response = await fetch(`${API_URL}/books?page=${pageNum}&limit=2`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = (await response.json()) as PaginatedBooksResponse | ErrorResponse;
        if (!response.ok) {
          throw new Error((data as ErrorResponse).message || "Failed to fetch books");
        }

        const { books: fetchedBooks, totalPages } = data as PaginatedBooksResponse;

        setBooks((prevBooks) => {
          const mergedBooks =
            refresh || pageNum === 1 ? fetchedBooks : [...prevBooks, ...fetchedBooks];
          const uniqueBooks = Array.from(
            new Map(mergedBooks.map((book) => [book._id, book])).values()
          );
          return uniqueBooks;
        });

        setHasMore(pageNum < totalPages);
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching books", error);
      } finally {
        if (refresh) {
          await sleep(800);
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    void fetchBooks();
  }, [fetchBooks]);

  const handleLoadMore = useCallback(async (): Promise<void> => {
    if (hasMore && !loading && !refreshing) {
      await fetchBooks(page + 1);
    }
  }, [fetchBooks, hasMore, loading, page, refreshing]);

  const renderRatingStars = (rating: number): JSX.Element[] => {
    const stars: JSX.Element[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderItem: ListRenderItem<Book> = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>

      <View style={styles.bookImageContainer}>
        <Image source={{ uri: item.image }} style={styles.bookImage} contentFit="cover" />
      </View>

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>{formatPublishDate(item.createdAt)}에 공유됨</Text>
      </View>
    </View>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList<Book>
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void fetchBooks(1, true);
            }}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={() => {
          void handleLoadMore();
        }}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookStore</Text>
            <Text style={styles.headerSubtitle}>커뮤니티의 추천 도서를 만나보세요👇</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>아직 추천된 책이 없어요</Text>
            <Text style={styles.emptySubtext}>첫 번째로 책을 공유해 보세요!</Text>
          </View>
        }
      />
    </View>
  );
}
