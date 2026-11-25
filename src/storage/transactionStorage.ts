import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Transaction} from '../types/pos';

const TRANSACTIONS_KEY = '@pak-de-surya/transactions/v1';

export async function getTransactions(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Transaction[];
  } catch {
    return [];
  }
}

export async function saveTransaction(transaction: Transaction): Promise<void> {
  const current = await getTransactions();
  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify([transaction, ...current]),
  );
}

export async function replaceTransactions(
  transactions: Transaction[],
): Promise<void> {
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}
