import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, RotateCcw, ArrowRight, Users, Calculator as CalcIcon, Share2, Check } from "lucide-react";
import { Person, Expense, calculateSettlements } from "@/lib/settlement";
import { Calculator } from "@/components/Calculator";

const DEFAULT_INITIALS = "ABCDEFGHIJ".split("");

function generatePeople(count: number, existing: Person[]): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    initial: existing[i]?.initial || DEFAULT_INITIALS[i],
  }));
}

function PersonBadge({
  person,
  onInitialChange,
}: {
  person: Person;
  onInitialChange: (id: string, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="w-11 h-11 rounded-full bg-primary text-primary-foreground text-sm font-bold text-center outline-none ring-2 ring-ring ring-offset-2"
        defaultValue={person.initial}
        maxLength={3}
        autoFocus
        onBlur={(e) => {
          const val = e.target.value.trim().toUpperCase() || person.initial;
          onInitialChange(person.id, val);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="w-11 h-11 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0 active:scale-95 transition-transform shadow-sm hover:shadow-md"
      title="Tap to rename"
    >
      {person.initial}
    </button>
  );
}

const Index = () => {
  const [people, setPeople] = useState<Person[]>(generatePeople(2, []));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [selectedPayer, setSelectedPayer] = useState<string | null>(null);
  const [showCalc, setShowCalc] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleShare = useCallback(async () => {
    const paidByPerson = people.map((p) => ({
      initial: p.initial,
      paid: expenses.filter((e) => e.paidBy === p.id).reduce((s, e) => s + e.amount, 0),
      net: Math.round(
        (expenses.filter((e) => e.paidBy === p.id).reduce((s, e) => s + e.amount, 0) - share) * 100
      ) / 100,
    }));

    const lines: string[] = [
      `Who Paid? — Split Receipt`,
      `${"─".repeat(28)}`,
      ``,
      `Total: $${total.toFixed(2)}  |  Per person: $${share.toFixed(2)}`,
      `${people.length} people  ·  ${expenses.length} expense${expenses.length !== 1 ? "s" : ""}`,
      ``,
    ];

    if (expenses.length > 0) {
      lines.push(`Expenses:`);
      expenses.forEach((e) => {
        lines.push(`  ${getInitial(e.paidBy)} paid $${e.amount.toFixed(2)}  —  ${e.label}`);
      });
      lines.push(``);
    }

    lines.push(`Balances:`);
    paidByPerson
      .sort((a, b) => b.net - a.net)
      .forEach(({ initial, net }) => {
        if (net > 0.005) lines.push(`  ${initial} is owed $${net.toFixed(2)}`);
        else if (net < -0.005) lines.push(`  ${initial} owes $${Math.abs(net).toFixed(2)}`);
        else lines.push(`  ${initial} is settled`);
      });

    if (settlements.length > 0) {
      lines.push(``);
      lines.push(`Settle up:`);
      settlements.forEach((t) => {
        lines.push(`  ${t.from} → ${t.to}:  $${t.amount.toFixed(2)}`);
      });
    }

    lines.push(``);
    lines.push(`Sent via Who Paid?`);

    const text = lines.join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or not supported, fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [people, expenses, total, share, settlements, getInitial]);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={new URL("/favicon.svg", import.meta.url).href} alt="Who Paid? logo" width={28} height={28} />
            <h1 className="text-xl font-bold tracking-tight text-foreground">Who Paid?</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reset
          </Button>
        </div>
      </header>

      {/* Calculator modal */}
      {showCalc && (
        <Calculator
          onClose={() => setShowCalc(false)}
          onUse={(val) => setAmount(val)}
        />
      )}

      <main className="mx-auto w-full max-w-md flex-1 space-y-3 px-4 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Running Total — visual anchor */}
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/40 border border-primary/20 p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Spent</p>
              <p className="text-3xl font-bold tabular-nums text-foreground">${total.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Per Person</p>
              <p className="text-xl font-semibold tabular-nums text-foreground">${share.toFixed(2)}</p>
            </div>
          </div>
          {expenses.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""} across {people.length} people
            </p>
          )}
          {expenses.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1.5">Add expenses below to get started</p>
          )}
        </div>

        {/* People Setup */}
        <Card className="border-border/50 shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              People
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full shadow-sm active:scale-95 transition-transform"
                onClick={() => setPersonCount(-1)}
                disabled={people.length <= 2}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[2.5ch] text-center text-2xl font-bold tabular-nums text-foreground">
                {people.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full shadow-sm active:scale-95 transition-transform"
                onClick={() => setPersonCount(1)}
                disabled={people.length >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {people.map((p) => (
                <PersonBadge
                  key={p.id}
                  person={p}
                  onInitialChange={updateInitial}
                />
              ))}
            </div>
            <p className="text-center text-[11px] text-muted-foreground">Tap a circle to rename</p>
          </CardContent>
        </Card>

        {/* Add Expense */}
        <Card className="border-border/50 shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Add Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 pr-10 h-11 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                  min="0"
                  step="0.01"
                />
                <button
                  type="button"
                  onClick={() => setShowCalc(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Open calculator"
                >
                  <CalcIcon className="h-4 w-4" />
                </button>
              </div>
              <Input
                placeholder="Label (optional)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="flex-1 h-11 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Who paid?</p>
              <div className="flex flex-wrap gap-2">
                {people.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPayer(p.id)}
                    className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center transition-all duration-200 active:scale-95 ${
                      selectedPayer === p.id
                        ? "bg-primary text-primary-foreground shadow-md scale-[1.05]"
                        : "bg-secondary text-secondary-foreground border-2 border-border hover:border-primary/40 hover:bg-accent"
                    }`}
                  >
                    {p.initial}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="w-full h-11 font-semibold active:scale-[0.98] transition-transform"
              onClick={addExpense}
              disabled={!amount || parseFloat(amount) <= 0 || !selectedPayer}
            >
              Add Expense
            </Button>
          </CardContent>
        </Card>

        {/* Expense List */}
        {expenses.length > 0 && (
          <Card className="border-border/50 shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">
                Expenses
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">({expenses.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ul className="divide-y divide-border/60">
                {expenses.map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-2.5 group">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                        {getInitial(e.paidBy)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.label}</p>
                        <p className="text-xs text-muted-foreground">${e.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteExpense(e.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Settlement Summary */}
        {expenses.length > 0 && (() => {
          const paidByPerson = people.map((p) => ({
            person: p,
            paid: expenses.filter((e) => e.paidBy === p.id).reduce((s, e) => s + e.amount, 0),
          }));
          const topPayer = paidByPerson.reduce((a, b) => (b.paid > a.paid ? b : a));
          const balances = paidByPerson.map(({ person, paid }) => ({
            person,
            paid,
            net: Math.round((paid - share) * 100) / 100,
          }));
          const sortedBalances = [...balances].sort((a, b) => b.net - a.net);
          const contextLine = topPayer.paid > 0
            ? `${topPayer.person.initial} covered most of the group`
            : null;

          return (
          <Card className="border-border/50 shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {contextLine && (
                <p className="text-xs text-muted-foreground italic">{contextLine}</p>
              )}

              {/* Balances */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Balances</p>
                {sortedBalances.map(({ person, net }) => {
                  const isOwed = net > 0.005;
                  const owes = net < -0.005;
                  return (
                    <div
                      key={person.id}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                        isOwed
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : owes
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center ${
                          isOwed
                            ? "bg-green-500/20"
                            : owes
                            ? "bg-red-500/20"
                            : "bg-muted"
                        }`}>
                          {person.initial}
                        </span>
                        <span className={isOwed || owes ? "font-semibold text-sm" : "font-medium text-sm"}>
                          {isOwed ? "is owed" : owes ? "owes" : "settled"}
                        </span>
                      </div>
                      <span className={`tabular-nums ${isOwed || owes ? "text-base font-bold" : "font-medium"}`}>
                        {net === 0 ? "\u2014" : `$${Math.abs(net).toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Settle Up */}
              {settlements.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Settle Up</p>
                  {settlements.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="w-7 h-7 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 text-[11px] font-bold flex items-center justify-center">{t.from}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="w-7 h-7 rounded-full bg-green-500/15 text-green-700 dark:text-green-400 text-[11px] font-bold flex items-center justify-center">{t.to}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-primary">
                        ${t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-2">
                  All settled up!
                </p>
              )}

              {/* Paid breakdown */}
              <div className="space-y-1 border-t pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paid</p>
                {paidByPerson.map(({ person, paid }) => (
                  <div
                    key={person.id}
                    className={`flex justify-between text-sm py-0.5 ${
                      person.id === topPayer.person.id && topPayer.paid > 0
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span>{person.initial} paid</span>
                    <span className="tabular-nums">${paid.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Share */}
              <Button
                variant="outline"
                className="w-full mt-1 active:scale-[0.98] transition-transform"
                onClick={handleShare}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Split
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          );
        })()}

        {/* Footer */}
        <footer className="pt-2 pb-2 text-center">
          <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground underline">
            Privacy Policy
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default Index;
