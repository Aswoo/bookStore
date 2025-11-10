export interface AuthUser {
  id: string;
  username: string;
  email: string;
  profileImage: string;
  createdAt: string;
}

export interface AuthSuccessResponse {
  token: string;
  user: AuthUser;
}

export interface ErrorResponse {
  message?: string;
}

export interface BookUser {
  _id: string;
  username: string;
  profileImage: string;
}

export interface Book {
  _id: string;
  title: string;
  caption: string;
  rating: number;
  image: string;
  user: BookUser;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBooksResponse {
  books: Book[];
  currentPage: number;
  totalBooks: number;
  totalPages: number;
}

