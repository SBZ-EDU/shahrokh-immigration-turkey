/**
 * Neshan Service — Layer 1: Geographic Discovery
 * Based on apieco.ir/docs/neshan & api.neshan.org
 * For Shahrokh Business Intelligence Platform
 */

const NESHAN_API_BASE = 'https://api.neshan.org';
const APIECO_BASE = 'https://api.apieco.ir';

const getNeshanKey = (): string => {
  const vite = (import.meta as any).env?.VITE_NESHAN_API_KEY || '';
  const node = (typeof process !== 'undefined' && (process as any).env?.NESHAN_API_KEY) || '';
  return vite || node || '';
};

export interface NeshanPOI {
  id: string;
  title: string;
  address: string;
  category: string;
  region: string;
  neighbourhood: string;
  location: { x: number; y: number }; // lon, lat
  phone?: string;
}

export interface BusinessRecord {
  business_id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  region?: string;
  source: 'neshan';
  // Layer 3-6 filled later
  website?: string;
  website_found?: boolean;
  website_status?: number;
  https?: boolean;
  wordpress?: boolean;
  has_contact_page?: boolean;
  has_online_order?: boolean;
  seo_score?: number;
  digital_maturity?: number; // 1-5
  last_checked?: string;
}

// Layer 1: Search / Nearby Search
export const searchBusinesses = async (params: {
  term: string;
  lat: number;
  lng: number;
  radius?: number;
}): Promise<BusinessRecord[]> => {
  const key = getNeshanKey();
  if (!key) {
    console.warn('NESHAN_API_KEY not set — using mock data for', params.term);
    return getMockBusinesses(params.term, params.lat, params.lng);
  }

  // Via Cloudflare Function proxy to hide key, or direct
  const url = `/api/neshan/search?term=${encodeURIComponent(params.term)}&lat=${params.lat}&lng=${params.lng}&radius=${params.radius || 5000}`;
  try {
    const res = await fetch(url, { headers: { 'Api-Key': key } });
    const data = await res.json();
    if (data.items) return normalizeNeshanResults(data.items, params.term);
    return getMockBusinesses(params.term, params.lat, params.lng);
  } catch (e) {
    console.error('Neshan search failed', e);
    return getMockBusinesses(params.term, params.lat, params.lng);
  }
};

const normalizeNeshanResults = (items: any[], term: string): BusinessRecord[] => {
  return items.map((it: any, idx: number) => ({
    business_id: `nes_${it.id || idx}`,
    name: it.title || it.name || term,
    category: it.category || term,
    latitude: it.location?.y || it.location?.latitude || 35.7,
    longitude: it.location?.x || it.location?.longitude || 51.3,
    address: it.address || '',
    phone: it.phone,
    region: it.region,
    source: 'neshan' as const,
  }));
};

// Mock for demo / when key not set — Tehran District 5 example
const getMockBusinesses = (term: string, lat: number, lng: number): BusinessRecord[] => {
  const mockNames: Record<string, string[]> = {
    restaurant: ['رستوران سنتی شاهرخ', 'رستوران ایتالیایی آرمین', 'کباب‌سرای تهران'],
    clinic: ['کلینیک زیبایی آرمین', 'درمانگاه شبانه‌روزی', 'کلینیک دندانپزشکی لبخند'],
    'beauty salon': ['سالن زیبایی رز', 'آرایشگاه مردانه پرستیژ'],
    hotel: ['هتل پارسیان', 'هتل اسپیناس'],
    supermarket: ['سوپرمارکت رفاه', 'هایپراستار'],
    default: [`${term} نمونه ۱`, `${term} نمونه ۲`, `${term} نمونه ۳`],
  };
  const names = mockNames[term.toLowerCase()] || mockNames.default;
  return names.map((name, i) => ({
    business_id: `mock_${term}_${i}`,
    name,
    category: term,
    latitude: lat + (Math.random() - 0.5) * 0.05,
    longitude: lng + (Math.random() - 0.5) * 0.05,
    address: `تهران، منطقه ۵، خیابان نمونه ${i + 1}`,
    phone: `021-44${100000 + i}`,
    source: 'neshan',
  }));
};

// Layer 2: Deduplication
export const deduplicateBusinesses = (list: BusinessRecord[]): BusinessRecord[] => {
  const seen = new Set<string>();
  return list.filter(b => {
    const key = `${b.name.trim().toLowerCase()}-${b.phone || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Layer 4: Reverse Geocoding (mock)
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  const key = getNeshanKey();
  if (!key) return `آدرس تقریبی: ${lat.toFixed(4)}, ${lng.toFixed(4)} — تهران`;
  try {
    const res = await fetch(`/api/neshan/reverse?lat=${lat}&lng=${lng}`, { headers: { 'Api-Key': key } });
    const data = await res.json();
    return data.formatted_address || `آدرس: ${lat}, ${lng}`;
  } catch {
    return `آدرس: ${lat}, ${lng}`;
  }
};

// Layer 3: Website Discovery (mock scoring)
export const discoverWebsite = async (business: BusinessRecord): Promise<Partial<BusinessRecord>> => {
  // Simulate discovery by searching name + city
  const confidence = Math.random();
  const hasWebsite = confidence > 0.6;
  if (!hasWebsite) return { website_found: false };
  
  const domain = business.name.replace(/\s+/g, '').toLowerCase().slice(0, 10) + '.ir';
  return {
    website: `https://${domain}`,
    website_found: true,
    website_status: 200,
    https: true,
    wordpress: Math.random() > 0.5,
    has_contact_page: Math.random() > 0.3,
    has_online_order: business.category.includes('restaurant') ? Math.random() > 0.5 : false,
    seo_score: Math.floor(Math.random() * 40) + 30,
    digital_maturity: Math.floor(Math.random() * 3) + 1,
    last_checked: new Date().toISOString(),
  };
};
