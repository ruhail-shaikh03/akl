export type BucketItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  targetDate: string | null;
  completionPhotoBlobUrl: string | null;
  completedAt: Date | null;
  createdAt: Date;
  addedByName: string | null;
  completedByName: string | null;
};
