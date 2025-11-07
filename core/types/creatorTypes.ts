export interface CreatorJob {
  id: string;
  status: 'processing' | 'ready' | 'uploaded' | 'failed';
  videoJobId?: string;
  musicJob?: any;
  youtubeMeta?: {
    title: string;
    description: string;
    tags: string[];
    privacy: string;
  };
  videoStatus?: any;
  videoUrl?: string;
  youtubeUrl?: string;
  createdAt: string;
  updatedAt?: string;
}