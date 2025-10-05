export interface CompletedSolution {
  id: string;
  authorName: string;
  authorId: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isAuthorLike?: boolean;
  likesCount?: number;
}
