/**
 * Business Analyzer — Layer 5 & 6: AI Analysis + Lead Scoring
 * For Shahrokh Platform — expense collaboration
 */

import { BusinessRecord } from './neshanService';

export interface BusinessAnalysis {
  business_id: string;
  website_quality: number; // 0-100
  seo_score: number;
  mobile_score: number;
  has_ecommerce: boolean;
  has_booking: boolean;
  digital_maturity: number; // 1-5
  recommendation: string;
  expense_collaboration_score?: number;
}

export const analyzeBusiness = (b: BusinessRecord): BusinessAnalysis => {
  const hasSite = b.website_found;
  const seo = b.seo_score || 0;
  
  let digitalMaturity = 1;
  if (hasSite && seo > 60) digitalMaturity = 4;
  else if (hasSite && seo > 40) digitalMaturity = 3;
  else if (hasSite) digitalMaturity = 2;

  // Expense collaboration score — businesses without site or weak site are high potential for shared web costs
  const collabScore = !hasSite ? 5 : seo < 40 ? 4 : seo < 60 ? 3 : 1;

  let recommendation = '';
  if (!hasSite) recommendation = 'ساخت وب‌سایت AI — پتانسیل بالا، هزینه مشترک پیشنهادی ۳۰٪ تخفیف گروهی';
  else if (seo < 40) recommendation = 'بازطراحی + سئو محلی — نیاز فوری';
  else if (!b.has_online_order && b.category.includes('restaurant')) recommendation = 'افزودن سفارش آنلاین + پرداخت';
  else recommendation = 'بهینه‌سازی سئو و موبایل';

  return {
    business_id: b.business_id,
    website_quality: hasSite ? Math.floor(Math.random() * 30) + 50 : 0,
    seo_score: seo,
    mobile_score: Math.floor(Math.random() * 30) + 60,
    has_ecommerce: !!b.wordpress,
    has_booking: !!b.has_online_order,
    digital_maturity: digitalMaturity,
    recommendation,
    expense_collaboration_score: collabScore,
  };
};

export const getExpenseCollaborationGroups = (businesses: (BusinessRecord & BusinessAnalysis)[]) => {
  const groups = {
    noWebsite: businesses.filter(b => !b.website_found),
    weakSite: businesses.filter(b => b.website_found && (b.seo_score || 0) < 40),
    mediumSite: businesses.filter(b => b.website_found && (b.seo_score || 0) >= 40 && (b.seo_score || 0) < 60),
    goodSite: businesses.filter(b => (b.seo_score || 0) >= 60),
  };
  return groups;
};

// Layer 6: Expense sharing proposal
export const proposeExpenseSharing = (group: BusinessRecord[], category: string) => {
  const count = group.length;
  const baseCost = category === 'restaurant' ? 800 : 1200; // EUR base for website
  const sharedCost = Math.floor(baseCost * 0.7); // 30% off for group
  const saving = baseCost - sharedCost;
  return {
    count,
    category,
    baseCost,
    sharedCost,
    saving,
    totalSaving: saving * count,
    proposal: `برای ${count} کسب‌وکار ${category}، هزینه ساخت سایت از ${baseCost}€ به ${sharedCost}€ (۳۰٪ تخفیف گروهی) — صرفه‌جویی کل ${saving * count}€`,
  };
};
