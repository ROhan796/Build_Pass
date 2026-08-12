export type CardFormat = 'format_a' | 'format_b'; // format_a: PFP Frame (1080x1080), format_b: Builder ID Card (1080x1350)

export type CardTheme = 'cyan_surf' | 'ember_bonfire' | 'sand_dunes' | 'neon_palm';

export interface CardData {
  id: string;
  format: CardFormat;
  photoUrl: string;
  name: string;
  role: string;
  title: string; // Auto-generated or custom builder title e.g. "Fullstack Sorcerer 🧙"
  handle?: string; // Twitter/X handle e.g. "@arjun_sharma"
  theme: CardTheme;
  cardNo: number; // e.g., #0427
  generatedAt: string;
  downloadCount: number;
  shareCount: number;
  imageDataUrl?: string;
  deviceType?: 'mobile' | 'desktop';
}

export interface AppStats {
  totalGenerations: number;
  todayGenerations: number;
  downloadPercentage: number;
  sharePercentage: number;
  formatADount: number;
  formatBCount: number;
  dailyTrends: { date: string; count: number }[];
  deviceBreakdown: { name: string; value: number }[];
}
