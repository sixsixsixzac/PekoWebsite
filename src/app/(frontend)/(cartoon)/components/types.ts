/**
 * Types for reading page components
 */

export interface EpisodeInfo {
  epId: number;
  epNo: number;
  epName: string;
  epPrice: number;
}

export interface NavigationInfo {
  prevEpNo: number | null;
  nextEpNo: number | null;
}

export interface EpisodeUnlockProps {
  cartoonUuid: string;
  episode: string;
  episodeInfo: EpisodeInfo;
  navigation: NavigationInfo;
  userPoints?: number | null;
}

export interface MangaReadProps {
  cartoonUuid: string;
  episode: string;
  buyImmediately?: boolean;
  loadFullImages?: boolean;
  userPoints?: number | null;
}

export interface EpisodeHeaderProps {
  episodeInfo: { epName: string; epNo: number } | null;
  navigation: NavigationInfo | null;
  onNavigate: (epNo: number | null) => void;
  isLoading?: boolean;
}

export interface EpisodeFooterProps {
  totalPages?: number;
  currentPage?: number;
  onPageJump?: (page: number) => void;
  shareUrl?: string;
}

