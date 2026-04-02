export interface Review {
  id: number;
  authorName: string;
  authorPosition: string | null;
  authorAvatar: string | null;
  text: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  onlyPublished?: boolean;
}

export interface GetReviewsResponse {
  items: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateReviewParams {
  authorName: string;
  authorPosition?: string;
  authorAvatar?: string;
  text: string;
  rating?: number;
  isPublished?: boolean;
}

export type UpdateReviewParams = Partial<CreateReviewParams>;
