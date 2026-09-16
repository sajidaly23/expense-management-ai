import { EXPENSE_CATEGORIES, ExpenseCategory } from '../expense/expense.model.js';
import { Expense } from '../expense/expense.model.js';
import { isDatabaseConnected } from '../../config/db.js';

const KEYWORD_MAP: Record<ExpenseCategory, string[]> = {
  Food: ['food', 'restaurant', 'grocery', 'lunch', 'dinner', 'cafe', 'meal', 'uber eats', 'foodpanda'],
  Transport: ['uber', 'careem', 'fuel', 'petrol', 'bus', 'train', 'taxi', 'transport', 'metro'],
  Rent: ['rent', 'landlord', 'lease', 'housing'],
  Bills: ['bill', 'electric', 'electricity', 'water', 'internet', 'phone', 'mobile', 'subscription', 'netflix', 'spotify'],
  Education: ['school', 'tuition', 'course', 'book', 'university', 'education', 'exam'],
  Healthcare: ['doctor', 'hospital', 'pharmacy', 'medicine', 'health', 'clinic', 'dental'],
  Shopping: ['shop', 'mall', 'amazon', 'clothes', 'clothing', 'shoes', 'retail'],
  Entertainment: ['movie', 'cinema', 'game', 'concert', 'entertainment', 'hobby'],
  Travel: ['flight', 'hotel', 'travel', 'airbnb', 'vacation', 'trip'],
  Utilities: ['gas', 'utility', 'maintenance', 'repair'],
  Other: [],
};

export function suggestCategoryFromText(description: string): {
  category: ExpenseCategory;
  confidence: number;
  source: 'keyword' | 'history' | 'default';
} {
  const text = description.toLowerCase().trim();
  if (!text) return { category: 'Other', confidence: 0.3, source: 'default' };

  let best: ExpenseCategory = 'Other';
  let bestScore = 0;

  for (const category of EXPENSE_CATEGORIES) {
    if (category === 'Other') continue;
    for (const kw of KEYWORD_MAP[category]) {
      if (text.includes(kw)) {
        const score = kw.length / text.length + 0.5;
        if (score > bestScore) {
          bestScore = score;
          best = category;
        }
      }
    }
  }

  if (bestScore > 0) {
    return { category: best, confidence: Math.min(0.95, 0.5 + bestScore * 0.2), source: 'keyword' };
  }

  return { category: 'Other', confidence: 0.35, source: 'default' };
}

export async function suggestCategory(userId: string, description: string) {
  const keyword = suggestCategoryFromText(description);

  if (!isDatabaseConnected() || !description.trim()) {
    return keyword;
  }

  const history = await Expense.find({
    userId,
    description: { $regex: description.trim().slice(0, 20), $options: 'i' },
  })
    .sort({ date: -1 })
    .limit(5)
    .lean();

  if (history.length > 0) {
    const counts: Record<string, number> = {};
    for (const row of history) {
      counts[row.category] = (counts[row.category] || 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 2) {
      return {
        category: top[0] as ExpenseCategory,
        confidence: Math.min(0.9, 0.6 + top[1] * 0.05),
        source: 'history' as const,
      };
    }
  }

  return keyword;
}

export async function findDuplicateExpenses(
  userId: string,
  amount: number,
  description: string,
  date: string
) {
  if (!isDatabaseConnected()) return [];
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);
  const windowStart = new Date(dayStart);
  windowStart.setUTCDate(windowStart.getUTCDate() - 3);
  const windowEnd = new Date(dayEnd);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + 3);

  const matches = await Expense.find({
    userId,
    amount,
    date: { $gte: windowStart, $lte: windowEnd },
    description: { $regex: description.trim().slice(0, 30), $options: 'i' },
  })
    .limit(5)
    .lean();

  return matches.map((m) => ({
    id: String(m._id),
    amount: m.amount,
    description: m.description,
    date: m.date.toISOString().slice(0, 10),
    category: m.category,
  }));
}
