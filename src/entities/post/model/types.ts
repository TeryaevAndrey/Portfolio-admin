import type { PaginationParams, PaginationResponse } from "@/shared/types/pagination.types";

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string[] | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetPostsParams extends PaginationParams {
  search?: string;
  onlyPublished?: boolean;
}

export interface GetPostsResponse extends PaginationResponse<Post[]> {}

export interface CreatePostParams {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  isPublished?: boolean;
}

export type UpdatePostParams = Partial<CreatePostParams>;
