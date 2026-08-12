import { CardData, AppStats } from '../types';

const STORAGE_KEY_CARDS = 'hhgoa_cards_v1';
const STORAGE_KEY_STATS = 'hhgoa_stats_v1';

// Seed showcase cards for the Landing Page Wall of Cards / Marquee
const SAMPLE_SHOWCASE_CARDS: CardData[] = [
  {
    id: 'demo-1',
    format: 'format_b',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    name: 'Ananya Roy',
    role: 'AI / Full Stack Developer',
    title: 'Gradient Descender 📉',
    handle: '@ananyaroy_dev',
    theme: 'cyan_surf',
    cardNo: 1042,
    generatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    downloadCount: 14,
    shareCount: 8,
    deviceType: 'desktop',
  },
  {
    id: 'demo-2',
    format: 'format_a',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    name: 'Arjun Sharma',
    role: 'Backend Barbarian ⚔️',
    title: 'Backend Barbarian ⚔️',
    handle: '@arjun_bytes',
    theme: 'ember_bonfire',
    cardNo: 1043,
    generatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    downloadCount: 22,
    shareCount: 12,
    deviceType: 'mobile',
  },
  {
    id: 'demo-3',
    format: 'format_b',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    name: 'Priya Nambiar',
    role: 'Frontend Architect · React',
    title: 'Pixel Whisperer 🎨',
    handle: '@priya_ux',
    theme: 'sand_dunes',
    cardNo: 1044,
    generatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    downloadCount: 19,
    shareCount: 11,
    deviceType: 'mobile',
  },
  {
    id: 'demo-4',
    format: 'format_a',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    name: 'Vikram Mehta',
    role: 'Founder & CEO @ ShipFast',
    title: 'Ship or Die Captain 🚢',
    handle: '@v_mehta',
    theme: 'neon_palm',
    cardNo: 1045,
    generatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    downloadCount: 31,
    shareCount: 18,
    deviceType: 'desktop',
  },
  {
    id: 'demo-5',
    format: 'format_b',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    name: 'Sarah Chen',
    role: 'Rust & Security Protocol Lead',
    title: 'Borrow Checker Slayer 🦀',
    handle: '@sarah_rust',
    theme: 'cyan_surf',
    cardNo: 1046,
    generatedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    downloadCount: 28,
    shareCount: 15,
    deviceType: 'mobile',
  },
];

export function getStoredCards(): CardData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(SAMPLE_SHOWCASE_CARDS));
      return SAMPLE_SHOWCASE_CARDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_SHOWCASE_CARDS;
  } catch {
    return SAMPLE_SHOWCASE_CARDS;
  }
}

export function saveCard(card: CardData): void {
  try {
    const existing = getStoredCards();
    const updated = [card, ...existing.filter((c) => c.id !== card.id)];
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(updated.slice(0, 50)));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export function getCardById(id: string): CardData | undefined {
  const cards = getStoredCards();
  return cards.find((c) => c.id === id);
}

export function trackCardDownload(id: string): void {
  try {
    const cards = getStoredCards();
    const card = cards.find((c) => c.id === id);
    if (card) {
      card.downloadCount = (card.downloadCount || 0) + 1;
      saveCard(card);
    }
  } catch (e) {
    console.error('Track download error:', e);
  }
}

export function trackCardShare(id: string): void {
  try {
    const cards = getStoredCards();
    const card = cards.find((c) => c.id === id);
    if (card) {
      card.shareCount = (card.shareCount || 0) + 1;
      saveCard(card);
    }
  } catch (e) {
    console.error('Track share error:', e);
  }
}

export function getAppStats(): AppStats {
  const cards = getStoredCards();
  const totalGenerations = 1247 + cards.length - SAMPLE_SHOWCASE_CARDS.length;
  const todayGenerations = 89 + cards.filter(c => {
    const diffHours = (Date.now() - new Date(c.generatedAt).getTime()) / (1000 * 3600);
    return diffHours < 24;
  }).length;

  const formatADount = cards.filter((c) => c.format === 'format_a').length;
  const formatBCount = cards.filter((c) => c.format === 'format_b').length;

  const totalDownloads = cards.reduce((acc, c) => acc + (c.downloadCount || 0), 0);
  const totalShares = cards.reduce((acc, c) => acc + (c.shareCount || 0), 0);

  const downloadPercentage = cards.length > 0 ? Math.min(98, Math.round((totalDownloads / Math.max(1, cards.length)) * 100)) : 52;
  const sharePercentage = cards.length > 0 ? Math.min(95, Math.round((totalShares / Math.max(1, cards.length)) * 100)) : 38;

  // Generate 7-day trend data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyTrends = days.map((day, idx) => ({
    date: day,
    count: Math.floor(110 + idx * 24 + Math.sin(idx) * 40),
  }));

  const mobileCount = cards.filter((c) => c.deviceType === 'mobile').length + 72;
  const desktopCount = cards.filter((c) => c.deviceType === 'desktop').length + 28;

  return {
    totalGenerations,
    todayGenerations,
    downloadPercentage,
    sharePercentage,
    formatADount: formatADount + 420,
    formatBCount: formatBCount + 827,
    dailyTrends,
    deviceBreakdown: [
      { name: 'Mobile', value: mobileCount },
      { name: 'Desktop', value: desktopCount },
    ],
  };
}
