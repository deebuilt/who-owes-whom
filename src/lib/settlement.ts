export interface Person {
  id: string;
  initial: string;
}

export interface Expense {
  id: string;
  amount: number;
  paidBy: string; // person id
  label: string;
}

export interface Transaction {
  from: string; // person initial
  to: string;   // person initial
  amount: number;
}

export function calculateSettlements(
  people: Person[],
  expenses: Expense[]
): Transaction[] {
  if (people.length === 0 || expenses.length === 0) return [];

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const share = total / people.length;

  // Calculate net balance for each person (positive = owed money, negative = owes money)
  const balances = new Map<string, number>();
  for (const p of people) {
    balances.set(p.id, 0);
  }
  for (const e of expenses) {
    balances.set(e.paidBy, (balances.get(e.paidBy) || 0) + e.amount);
  }

  const debtors: { person: Person; amount: number }[] = [];
  const creditors: { person: Person; amount: number }[] = [];

  for (const p of people) {
    const net = Math.round(((balances.get(p.id) || 0) - share) * 100) / 100;
    if (net < -0.005) {
      debtors.push({ person: p, amount: -net });
    } else if (net > 0.005) {
      creditors.push({ person: p, amount: net });
    }
  }

  // Sort descending for greedy matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const payment = Math.min(debtors[i].amount, creditors[j].amount);
    const rounded = Math.round(payment * 100) / 100;

    if (rounded > 0) {
      transactions.push({
        from: debtors[i].person.initial,
        to: creditors[j].person.initial,
        amount: rounded,
      });
    }

    debtors[i].amount = Math.round((debtors[i].amount - payment) * 100) / 100;
    creditors[j].amount = Math.round((creditors[j].amount - payment) * 100) / 100;

    if (debtors[i].amount < 0.005) i++;
    if (creditors[j].amount < 0.005) j++;
  }

  return transactions;
}
