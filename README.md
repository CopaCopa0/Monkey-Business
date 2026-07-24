import React, { useState, useMemo } from "react";
import {
  Home, Receipt, Target, CalendarClock, Plus, X, ArrowUpRight, ArrowDownRight,
  Check, ChevronRight, Wallet, ShoppingCart, Utensils, Car, Sparkles, Zap,
  ShoppingBag, Trash2, TrendingUp,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  .budget-app {
    --paper: #EFEDE6;
    --card: #FBFAF7;
    --ink: #22281F;
    --ink-soft: #6B7062;
    --line: #DBD7CA;
    --accent: #2A5C87;
    --accent-soft: #DBE5EC;
    --warn: #AE4A2E;
    --warn-soft: #F2DCD3;
    --amber: #93701F;
    --amber-soft: #ECE1C4;
    font-family: 'Inter', sans-serif;
    color: var(--ink);
    background: var(--paper);
  }
  .budget-app .font-display { font-family: 'Fraunces', serif; }
  .budget-app .font-mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }

  .receipt-edge {
    height: 12px;
    background:
      linear-gradient(135deg, var(--paper) 50%, transparent 50%) 0 0/12px 12px repeat-x,
      linear-gradient(-135deg, var(--paper) 50%, transparent 50%) 0 0/12px 12px repeat-x;
  }
  .budget-app ::-webkit-scrollbar { display: none; }
  .budget-app * { scrollbar-width: none; }

  .sheet-enter {
    animation: sheetUp 0.22s ease-out;
  }
  @keyframes sheetUp {
    from { transform: translateY(16px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .fade-enter { animation: fadeIn 0.15s ease-out; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */
const CATEGORY_META = {
  groceries: { name: "Groceries", icon: ShoppingCart },
  dining: { name: "Dining", icon: Utensils },
  transport: { name: "Transport", icon: Car },
  fun: { name: "Fun", icon: Sparkles },
  utilities: { name: "Utilities", icon: Zap },
  shopping: { name: "Shopping", icon: ShoppingBag },
  other: { name: "Other", icon: Wallet },
};

const seedCategories = [
  { id: "groceries", limit: 450 },
  { id: "dining", limit: 150 },
  { id: "transport", limit: 120 },
  { id: "fun", limit: 100 },
  { id: "utilities", limit: 200 },
  { id: "shopping", limit: 150 },
];

const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d); };

const seedTransactions = [
  { id: "t1", type: "income", amount: 3200, categoryId: null, note: "Paycheck", date: daysAgo(18) },
  { id: "t2", type: "expense", amount: 84.32, categoryId: "groceries", note: "Trader Joe's", date: daysAgo(1) },
  { id: "t3", type: "expense", amount: 12.5, categoryId: "dining", note: "Coffee & bagel", date: daysAgo(1) },
  { id: "t4", type: "expense", amount: 38.0, categoryId: "transport", note: "Gas", date: daysAgo(3) },
  { id: "t5", type: "expense", amount: 22.75, categoryId: "fun", note: "Movie tickets", date: daysAgo(4) },
  { id: "t6", type: "expense", amount: 145.2, categoryId: "utilities", note: "Electric bill", date: daysAgo(6) },
  { id: "t7", type: "expense", amount: 61.4, categoryId: "shopping", note: "New shoes", date: daysAgo(8) },
  { id: "t8", type: "expense", amount: 46.1, categoryId: "groceries", note: "Whole Foods", date: daysAgo(9) },
  { id: "t9", type: "expense", amount: 28.0, categoryId: "dining", note: "Dinner out", date: daysAgo(11) },
];

const seedBills = [
  { id: "b1", name: "Rent", amount: 1450, dueDay: 1, paid: true },
  { id: "b2", name: "Internet", amount: 60, dueDay: 5, paid: true },
  { id: "b3", name: "Phone", amount: 45, dueDay: 12, paid: false },
  { id: "b4", name: "Streaming bundle", amount: 16, dueDay: 20, paid: false },
];

const fmt = (n) => {
  const neg = n < 0;
  const v = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${neg ? "-" : ""}🍌${v}`;
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                                */
/* ------------------------------------------------------------------ */
function Pill({ children, tone = "ink" }) {
  const styles = {
    ink: { background: "var(--line)", color: "var(--ink-soft)" },
    accent: { background: "var(--accent-soft)", color: "var(--accent)" },
    warn: { background: "var(--warn-soft)", color: "var(--warn)" },
    amber: { background: "var(--amber-soft)", color: "var(--amber)" },
  }[tone];
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={styles}>
      {children}
    </span>
  );
}

function ProgressBar({ pct, over }) {
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${Math.min(pct, 100)}%`,
          background: over ? "var(--warn)" : "var(--accent)",
        }}
      />
    </div>
  );
}

function IconBadge({ Icon, tone = "accent" }) {
  const styles = {
    accent: { background: "var(--accent-soft)", color: "var(--accent)" },
    warn: { background: "var(--warn-soft)", color: "var(--warn)" },
    amber: { background: "var(--amber-soft)", color: "var(--amber)" },
  }[tone];
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={styles}>
      <Icon size={18} strokeWidth={2} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screens                                                              */
/* ------------------------------------------------------------------ */
function HomeScreen({ transactions, categories, bills, spentByCategory, goTab }) {
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const totalLimit = categories.reduce((s, c) => s + c.limit, 0);
  const upcomingBills = [...bills].filter((b) => !b.paid).sort((a, b) => a.dueDay - b.dueDay).slice(0, 2);
  const recent = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4);

  return (
    <div className="px-4 pt-5 pb-24 fade-enter">
      <div className="mb-1">
        <h1 className="font-display text-2xl italic text-center" style={{ color: "var(--ink)" }}>Monkey Business</h1>
      </div>

      {/* Receipt hero */}
      <div className="mt-4 rounded-t-2xl px-5 pt-5 pb-6" style={{ background: "var(--ink)", color: "var(--card)" }}>
        <p className="text-xs tracking-wide uppercase" style={{ color: "#B7BEB0" }}>Balance</p>
        <p className="font-mono text-4xl font-semibold mt-1">{fmt(balance)}</p>
        <div className="flex gap-5 mt-4">
          <div className="flex items-center gap-1.5">
            <ArrowDownRight size={14} style={{ color: "#8FB8DA" }} />
            <span className="font-mono text-sm">{fmt(income)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUpRight size={14} style={{ color: "#E3A18B" }} />
            <span className="font-mono text-sm">{fmt(expense)}</span>
          </div>
        </div>
      </div>
      <div
        className="receipt-edge"
        style={{
          background:
            "linear-gradient(135deg, var(--paper) 50%, transparent 50%) 0 0/12px 12px repeat-x, linear-gradient(-135deg, var(--paper) 50%, transparent 50%) 0 0/12px 12px repeat-x",
          backgroundColor: "var(--ink)",
        }}
      />

      {/* Budget snapshot */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg" style={{ color: "var(--ink)" }}>Budgets</h2>
        <button onClick={() => goTab("budgets")} className="flex items-center gap-0.5 text-xs font-medium" style={{ color: "var(--accent)" }}>
          See all <ChevronRight size={14} />
        </button>
      </div>
      <div className="mt-3 rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm" style={{ color: "var(--ink-soft)" }}>Total spent of {fmt(totalLimit)}</span>
          <span className="font-mono text-sm font-semibold">{fmt(expense)}</span>
        </div>
        <ProgressBar pct={(expense / totalLimit) * 100} over={expense > totalLimit} />
        <div className="mt-4 flex flex-col gap-3">
          {categories.slice(0, 3).map((c) => {
            const spent = spentByCategory[c.id] || 0;
            const Icon = CATEGORY_META[c.id].icon;
            const over = spent > c.limit;
            return (
              <div key={c.id} className="flex items-center gap-3">
                <IconBadge Icon={Icon} tone={over ? "warn" : "accent"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{CATEGORY_META[c.id].name}</span>
                    <span className="font-mono" style={{ color: over ? "var(--warn)" : "var(--ink-soft)" }}>
                      {fmt(spent)} / {fmt(c.limit)}
                    </span>
                  </div>
                  <div className="mt-1"><ProgressBar pct={(spent / c.limit) * 100} over={over} /></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming bills */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg" style={{ color: "var(--ink)" }}>Upcoming bills</h2>
        <button onClick={() => goTab("bills")} className="flex items-center gap-0.5 text-xs font-medium" style={{ color: "var(--accent)" }}>
          See all <ChevronRight size={14} />
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {upcomingBills.length === 0 && (
          <p className="text-sm rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>
            All bills are paid. Nice work.
          </p>
        )}
        {upcomingBills.map((b) => (
          <div key={b.id} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
            <IconBadge Icon={CalendarClock} tone="amber" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{b.name}</p>
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>Due on the {b.dueDay}{ordinal(b.dueDay)}</p>
            </div>
            <span className="font-mono text-sm font-semibold">{fmt(b.amount)}</span>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg" style={{ color: "var(--ink)" }}>Recent activity</h2>
        <button onClick={() => goTab("transactions")} className="flex items-center gap-0.5 text-xs font-medium" style={{ color: "var(--accent)" }}>
          See all <ChevronRight size={14} />
        </button>
      </div>
      <div className="mt-3 rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
        {recent.map((t, i) => <TxRow key={t.id} t={t} last={i === recent.length - 1} />)}
      </div>
    </div>
  );
}

function ordinal(n) {
  if (n > 3 && n < 21) return "th";
  switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
}

function TxRow({ t, last }) {
  const Icon = t.type === "income" ? Wallet : CATEGORY_META[t.categoryId]?.icon || Wallet;
  const d = new Date(t.date);
  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <IconBadge Icon={Icon} tone={t.type === "income" ? "accent" : "ink"} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{t.note}</p>
        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
          {t.type === "income" ? "Income" : CATEGORY_META[t.categoryId]?.name} · {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </p>
      </div>
      <span className="font-mono text-sm font-semibold" style={{ color: t.type === "income" ? "var(--accent)" : "var(--ink)" }}>
        {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
      </span>
    </div>
  );
}

function TransactionsScreen({ transactions, categories, onDelete }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.categoryId === filter);
  const grouped = useMemo(() => {
    const map = {};
    [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1)).forEach((t) => {
      (map[t.date] = map[t.date] || []).push(t);
    });
    return map;
  }, [filtered]);

  return (
    <div className="px-4 pt-5 pb-24 fade-enter">
      <h1 className="font-display text-2xl italic mb-3">Transactions</h1>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <button onClick={() => setFilter("all")}>
          <Pill tone={filter === "all" ? "accent" : "ink"}>All</Pill>
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setFilter(c.id)} className="shrink-0">
            <Pill tone={filter === c.id ? "accent" : "ink"}>{CATEGORY_META[c.id].name}</Pill>
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm mt-8 text-center" style={{ color: "var(--ink-soft)" }}>No transactions in this category yet.</p>
      )}

      {Object.entries(grouped).map(([date, txs]) => (
        <div key={date} className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--ink-soft)" }}>
            {new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
            {txs.map((t, i) => (
              <div key={t.id} className="group flex items-center" style={{ borderBottom: i === txs.length - 1 ? "none" : "1px solid var(--line)" }}>
                <div className="flex-1"><TxRow t={t} last /></div>
                <button onClick={() => onDelete(t.id)} className="px-3 shrink-0" style={{ color: "var(--ink-soft)" }} aria-label="Delete transaction">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BudgetsScreen({ categories, spentByCategory, onUpdateLimit }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");

  const startEdit = (c) => { setEditing(c.id); setDraft(String(c.limit)); };
  const save = (id) => {
    const v = parseFloat(draft);
    if (!isNaN(v) && v > 0) onUpdateLimit(id, v);
    setEditing(null);
  };

  const totalLimit = categories.reduce((s, c) => s + c.limit, 0);
  const totalSpent = Object.values(spentByCategory).reduce((s, v) => s + v, 0);

  return (
    <div className="px-4 pt-5 pb-24 fade-enter">
      <h1 className="font-display text-2xl italic mb-1">Budgets</h1>
      <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
        <span className="font-mono">{fmt(totalSpent)}</span> spent of <span className="font-mono">{fmt(totalLimit)}</span> this month
      </p>

      <div className="flex flex-col gap-3">
        {categories.map((c) => {
          const spent = spentByCategory[c.id] || 0;
          const over = spent > c.limit;
          const Icon = CATEGORY_META[c.id].icon;
          return (
            <div key={c.id} className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
              <div className="flex items-center gap-3">
                <IconBadge Icon={Icon} tone={over ? "warn" : "accent"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{CATEGORY_META[c.id].name}</p>
                  {editing === c.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm">🍌</span>
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ""))}
                        onKeyDown={(e) => e.key === "Enter" && save(c.id)}
                        className="font-mono text-sm w-20 bg-transparent border-b outline-none"
                        style={{ borderColor: "var(--accent)" }}
                      />
                      <button onClick={() => save(c.id)} style={{ color: "var(--accent)" }}><Check size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(c)} className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                      Limit: <span className="font-mono" style={{ color: over ? "var(--warn)" : "var(--ink)" }}>{fmt(c.limit)}</span> · tap to edit
                    </button>
                  )}
                </div>
                <span className="font-mono text-sm font-semibold" style={{ color: over ? "var(--warn)" : "var(--ink)" }}>{fmt(spent)}</span>
              </div>
              <div className="mt-3"><ProgressBar pct={(spent / c.limit) * 100} over={over} /></div>
              {over && (
                <p className="text-xs mt-2 font-medium" style={{ color: "var(--warn)" }}>
                  {fmt(spent - c.limit)} over budget
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BillsScreen({ bills, onTogglePaid, onDelete, onAdd }) {
  const [showAdd, setShowAdd] = useState(false);
  const sorted = [...bills].sort((a, b) => a.dueDay - b.dueDay);
  const totalDue = bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="px-4 pt-5 pb-24 fade-enter">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl italic">Bills</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--ink)", color: "var(--card)" }}
          aria-label="Add bill"
        >
          <Plus size={18} />
        </button>
      </div>
      <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
        <span className="font-mono">{fmt(totalDue)}</span> still due this month
      </p>

      <div className="flex flex-col gap-2">
        {sorted.map((b) => (
          <div key={b.id} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
            <button
              onClick={() => onTogglePaid(b.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
              style={{
                background: b.paid ? "var(--accent)" : "transparent",
                border: `1.5px solid ${b.paid ? "var(--accent)" : "var(--line)"}`,
              }}
              aria-label={b.paid ? "Mark unpaid" : "Mark paid"}
            >
              {b.paid && <Check size={14} color="var(--card)" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ textDecoration: b.paid ? "line-through" : "none", color: b.paid ? "var(--ink-soft)" : "var(--ink)" }}>
                {b.name}
              </p>
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>Due on the {b.dueDay}{ordinal(b.dueDay)} · repeats monthly</p>
            </div>
            <span className="font-mono text-sm font-semibold">{fmt(b.amount)}</span>
            <button onClick={() => onDelete(b.id)} style={{ color: "var(--ink-soft)" }} aria-label="Delete bill">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {showAdd && <AddBillSheet onClose={() => setShowAdd(false)} onAdd={onAdd} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sheets (modals)                                                      */
/* ------------------------------------------------------------------ */
function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center fade-enter" style={{ background: "rgba(34,40,31,0.45)" }} onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl p-5 sheet-enter"
        style={{ background: "var(--paper)", maxHeight: "85%", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl italic">{title}</h3>
          <button onClick={onClose} style={{ color: "var(--ink-soft)" }} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: "var(--ink-soft)" }}>{children}</label>;
}

const inputStyle = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--line)",
  borderRadius: "0.75rem",
  padding: "0.65rem 0.9rem",
  fontSize: "0.9rem",
  color: "var(--ink)",
  outline: "none",
};

function AddTransactionSheet({ categories, onClose, onAdd }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [note, setNote] = useState("");

  const submit = () => {
    const v = parseFloat(amount);
    if (isNaN(v) || v <= 0 || (type === "expense" && !note.trim())) return;
    onAdd({
      id: `t${Date.now()}`,
      type,
      amount: v,
      categoryId: type === "income" ? null : categoryId,
      note: note.trim() || (type === "income" ? "Income" : "Expense"),
      date: iso(today),
    });
    onClose();
  };

  return (
    <Sheet title="Add transaction" onClose={onClose}>
      <div className="flex gap-2 mb-4">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="flex-1 py-2 rounded-xl text-sm font-medium capitalize"
            style={{
              background: type === t ? "var(--ink)" : "var(--card)",
              color: type === t ? "var(--paper)" : "var(--ink-soft)",
              border: "1px solid var(--line)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mb-3">
        <FieldLabel>Amount</FieldLabel>
        <input
          style={inputStyle}
          className="font-mono"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
        />
      </div>

      {type === "expense" && (
        <div className="mb-3">
          <FieldLabel>Category</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c.id} onClick={() => setCategoryId(c.id)}>
                <Pill tone={categoryId === c.id ? "accent" : "ink"}>{CATEGORY_META[c.id].name}</Pill>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5">
        <FieldLabel>Note</FieldLabel>
        <input style={inputStyle} placeholder={type === "income" ? "Paycheck" : "What was it for?"} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <button
        onClick={submit}
        className="w-full py-3 rounded-xl text-sm font-semibold"
        style={{ background: "var(--accent)", color: "var(--card)" }}
      >
        Add {type}
      </button>
    </Sheet>
  );
}

function AddBillSheet({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");

  const submit = () => {
    const v = parseFloat(amount);
    const d = parseInt(dueDay, 10);
    if (!name.trim() || isNaN(v) || v <= 0 || isNaN(d) || d < 1 || d > 31) return;
    onAdd({ id: `b${Date.now()}`, name: name.trim(), amount: v, dueDay: d, paid: false });
    onClose();
  };

  return (
    <Sheet title="Add bill" onClose={onClose}>
      <div className="mb-3">
        <FieldLabel>Bill name</FieldLabel>
        <input style={inputStyle} placeholder="e.g. Gym membership" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="mb-3">
        <FieldLabel>Amount</FieldLabel>
        <input style={inputStyle} className="font-mono" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} />
      </div>
      <div className="mb-5">
        <FieldLabel>Due day of month</FieldLabel>
        <input style={inputStyle} className="font-mono" inputMode="numeric" placeholder="1–31" value={dueDay} onChange={(e) => setDueDay(e.target.value.replace(/[^0-9]/g, ""))} />
      </div>
      <button onClick={submit} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: "var(--amber)", color: "var(--card)" }}>
        Add bill
      </button>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Nav                                                                  */
/* ------------------------------------------------------------------ */
function TabBar({ active, setActive, onAdd }) {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "transactions", icon: Receipt, label: "Activity" },
    { id: "budgets", icon: Target, label: "Budgets" },
    { id: "bills", icon: CalendarClock, label: "Bills" },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-20">
      <div className="w-full max-w-sm relative">
        <div className="flex items-center justify-around px-2 py-2.5" style={{ background: "var(--card)", borderTop: "1px solid var(--line)" }}>
          {tabs.slice(0, 2).map((t) => <TabButton key={t.id} t={t} active={active} setActive={setActive} />)}
          <div className="w-12" />
          {tabs.slice(2).map((t) => <TabButton key={t.id} t={t} active={active} setActive={setActive} />)}
        </div>
        <button
          onClick={onAdd}
          className="absolute left-1/2 flex items-center justify-center rounded-full shadow-lg"
          style={{ top: "-22px", transform: "translateX(-50%)", width: 52, height: 52, background: "var(--accent)", color: "var(--card)" }}
          aria-label="Add transaction"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}

function TabButton({ t, active, setActive }) {
  const isActive = active === t.id;
  return (
    <button onClick={() => setActive(t.id)} className="flex flex-col items-center gap-1 px-3 py-1">
      <t.icon size={20} strokeWidth={isActive ? 2.4 : 1.8} color={isActive ? "var(--accent)" : "var(--ink-soft)"} />
      <span className="text-[10px] font-medium" style={{ color: isActive ? "var(--accent)" : "var(--ink-soft)" }}>{t.label}</span>
    </button>
  );
}

const MONKEY_IMAGE = "data:image/jpeg;base64,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";

function MonkeyBackground() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <img
        src={MONKEY_IMAGE}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "65% 22%",
          opacity: 0.4,
          filter: "saturate(4.2) contrast(1.2)",
        }}
      />
      {/* Uniform wash (not a top-to-bottom fade) so text contrast stays consistent
          wherever it sits directly on the page background, not just near the top. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--paper)",
          opacity: 0.7,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root                                                                 */
/* ------------------------------------------------------------------ */
export default function BudgetApp() {
  const [tab, setTab] = useState("home");
  const [categories, setCategories] = useState(seedCategories);
  const [transactions, setTransactions] = useState(seedTransactions);
  const [bills, setBills] = useState(seedBills);
  const [showAddTx, setShowAddTx] = useState(false);

  const spentByCategory = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });
    return map;
  }, [transactions]);

  const addTransaction = (t) => setTransactions((prev) => [t, ...prev]);
  const deleteTransaction = (id) => setTransactions((prev) => prev.filter((t) => t.id !== id));
  const updateLimit = (id, limit) => setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, limit } : c)));
  const togglePaid = (id) => setBills((prev) => prev.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)));
  const deleteBill = (id) => setBills((prev) => prev.filter((b) => b.id !== id));
  const addBill = (b) => setBills((prev) => [...prev, b]);

  return (
    <div className="budget-app min-h-screen flex justify-center" style={{ background: "#DAD6C9" }}>
      <style>{TOKENS}</style>
      <div className="w-full max-w-sm relative" style={{ background: "var(--paper)", minHeight: "100vh", overflow: "hidden" }}>
        <MonkeyBackground />
        <div className="relative" style={{ zIndex: 10 }}>
          {tab === "home" && (
            <HomeScreen
              transactions={transactions}
              categories={categories}
              bills={bills}
              spentByCategory={spentByCategory}
              goTab={setTab}
            />
          )}
          {tab === "transactions" && (
            <TransactionsScreen transactions={transactions} categories={categories} onDelete={deleteTransaction} />
          )}
          {tab === "budgets" && (
            <BudgetsScreen categories={categories} spentByCategory={spentByCategory} onUpdateLimit={updateLimit} />
          )}
          {tab === "bills" && (
            <BillsScreen bills={bills} onTogglePaid={togglePaid} onDelete={deleteBill} onAdd={addBill} />
          )}

          <TabBar active={tab} setActive={setTab} onAdd={() => setShowAddTx(true)} />
          {showAddTx && <AddTransactionSheet categories={categories} onClose={() => setShowAddTx(false)} onAdd={addTransaction} />}
        </div>
      </div>
    </div>
  );
}
