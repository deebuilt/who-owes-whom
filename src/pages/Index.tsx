import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, RotateCcw, ArrowRight } from "lucide-react";
import { Person, Expense, calculateSettlements } from "@/lib/settlement";

const DEFAULT_INITIALS = "ABCDEFGHIJ".split("");

function generatePeople(count: number, existing: Person[]): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    initial: existing[i]?.initial || DEFAULT_INITIALS[i],
  }));
}

const Index = () => {
  const [people, setPeople] = useState<Person[]>(generatePeople(2, []));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [selectedPayer, setSelectedPayer] = useState<string | null>(null);

  const setPersonCount = useCallback(
    (delta: number) => {
      const next = Math.min(10, Math.max(2, people.length + delta));
      setPeople((prev) => generatePeople(next, prev));
      setSelectedPayer((prev) => {
        const idx = parseInt(prev?.slice(1) || "0");
        return idx >= next ? null : prev;
      });
    },
    [people.length]
  );

  const updateInitial = useCallback((id: string, value: string) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, initial: value.slice(0, 3) } : p))
    );
  }, []);

  const addExpense = useCallback(() => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0 || !selectedPayer) return;
    setExpenses((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        amount: Math.round(parsed * 100) / 100,
        paidBy: selectedPayer,
        label: label.trim() || "Expense",
      },
    ]);
    setAmount("");
    setLabel("");
  }, [amount, label, selectedPayer]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const reset = useCallback(() => {
    setPeople(generatePeople(2, []));
    setExpenses([]);
    setAmount("");
    setLabel("");
    setSelectedPayer(null);
  }, []);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const share = people.length > 0 ? total / people.length : 0;
  const settlements = calculateSettlements(people, expenses);
  const getInitial = (id: string) => people.find((p) => p.id === id)?.initial || "?";

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-foreground">Who Paid?</h1>
          <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        {/* People Setup */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">People</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPersonCount(-1)}
                disabled={people.length <= 2}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[2ch] text-center text-lg font-semibold text-foreground">
                {people.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPersonCount(1)}
                disabled={people.length >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {people.map((p) => (
                <Input
                  key={p.id}
                  value={p.initial}
                  onChange={(e) => updateInitial(p.id, e.target.value)}
                  className="h-9 w-14 text-center text-sm font-medium"
                  maxLength={3}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Expense */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
                min="0"
                step="0.01"
              />
              <Input
                placeholder="Label (optional)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="flex-1"
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Who paid?</p>
              <div className="flex flex-wrap gap-2">
                {people.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPayer(p.id)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      selectedPayer === p.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                  >
                    {p.initial}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="w-full"
              onClick={addExpense}
              disabled={!amount || parseFloat(amount) <= 0 || !selectedPayer}
            >
              Add Expense
            </Button>
          </CardContent>
        </Card>

        {/* Expense List */}
        {expenses.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {expenses.map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground">{e.label}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ${e.amount.toFixed(2)}
                      </span>
                      <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">
                        {getInitial(e.paidBy)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteExpense(e.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Settlement Summary */}
        {expenses.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Settlement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Per person</span>
                <span className="font-semibold text-foreground">${share.toFixed(2)}</span>
              </div>
              {settlements.length > 0 ? (
                <div className="space-y-2 border-t pt-3">
                  {settlements.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span>{t.from}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{t.to}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ${t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="border-t pt-3 text-center text-sm text-muted-foreground">
                  All settled up! 🎉
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
