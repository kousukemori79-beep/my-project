const express = require("express");
const fs = require("fs");
const path = require("path");
const machines = require("./data/machines.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== 経費精算 API =====
const EXPENSES_PATH = path.join(__dirname, "data", "expenses.json");

function readExpenses() {
  const data = fs.readFileSync(EXPENSES_PATH, "utf-8");
  return JSON.parse(data);
}

function writeExpenses(data) {
  fs.writeFileSync(EXPENSES_PATH, JSON.stringify(data, null, 2) + "\n");
}

// GET /api/expenses - 経費一覧取得
app.get("/api/expenses", (req, res) => {
  const data = readExpenses();
  const total = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  res.json({ expenses: data.expenses, total });
});

// POST /api/expenses - 経費登録
app.post("/api/expenses", (req, res) => {
  const { date, description, amount } = req.body;
  if (!date || !description || amount == null) {
    return res.status(400).json({ error: "date, description, amount は必須です" });
  }
  const parsed = Number(amount);
  if (isNaN(parsed) || parsed < 0) {
    return res.status(400).json({ error: "amount は0以上の数値を指定してください" });
  }
  const data = readExpenses();
  const newExpense = {
    id: Date.now(),
    date,
    description,
    amount: parsed,
  };
  data.expenses.push(newExpense);
  writeExpenses(data);
  res.status(201).json(newExpense);
});

// DELETE /api/expenses/:id - 経費削除
app.delete("/api/expenses/:id", (req, res) => {
  const id = Number(req.params.id);
  const data = readExpenses();
  const idx = data.expenses.findIndex((e) => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "経費が見つかりません" });
  }
  data.expenses.splice(idx, 1);
  writeExpenses(data);
  res.json({ message: "削除しました" });
});

// GET /insights - パチンコ機種データの分析・比較エンドポイント
app.get("/insights", (req, res) => {
  const { machine, week, metric } = req.query;

  // フィルタリング: 機種名
  let result = machines.machines;
  if (machine) {
    result = result.filter((m) => m.name.includes(machine));
    if (result.length === 0) {
      return res.status(404).json({ error: "機種が見つかりません" });
    }
  }

  // 特定の週を指定
  if (week) {
    const w = parseInt(week, 10);
    result = result.map((m) => ({
      ...m,
      weekly: m.weekly.filter((wk) => wk.week === w),
    }));
  }

  // サマリー生成
  const summary = result.map((m) => {
    const latestWeek = m.weekly.length > 0 ? m.weekly[m.weekly.length - 1] : null;
    const firstWeek = m.weekly.length > 0 ? m.weekly[0] : null;

    return {
      name: m.name,
      releaseDate: m.releaseDate,
      estimatedSales: m.estimatedSales,
      day1: m.day1,
      latestWeek,
      weeklyTrend: m.weekly.length > 0
        ? {
            打込変化率: firstWeek && latestWeek
              ? `${(((latestWeek.打込 - firstWeek.打込) / firstWeek.打込) * 100).toFixed(1)}%`
              : null,
            台粗利変化率: firstWeek && latestWeek
              ? `${(((latestWeek.台粗利 - firstWeek.台粗利) / firstWeek.台粗利) * 100).toFixed(1)}%`
              : null,
            中古相場変化率:
              firstWeek && latestWeek && firstWeek.中古相場 && latestWeek.中古相場
                ? `${(((latestWeek.中古相場 - firstWeek.中古相場) / firstWeek.中古相場) * 100).toFixed(1)}%`
                : null,
          }
        : null,
      totalWeeks: m.weekly.length,
    };
  });

  // 特定のメトリクスのみ返す
  if (metric) {
    const metricData = result.map((m) => ({
      name: m.name,
      day1: m.day1[metric] ?? null,
      weekly: m.weekly.map((w) => ({ week: w.week, [metric]: w[metric] ?? null })),
    }));
    return res.json({ metric, data: metricData });
  }

  res.json({ summary, detail: result });
});

// GET /insights/compare - 機種間比較
app.get("/insights/compare", (req, res) => {
  const data = machines.machines;

  const comparison = data.map((m) => {
    const weeks = m.weekly;
    const latest = weeks.length > 0 ? weeks[weeks.length - 1] : m.day1;

    return {
      name: m.name,
      releaseDate: m.releaseDate,
      estimatedSales: m.estimatedSales,
      latest打込: latest.打込,
      latest台粗利: latest.台粗利,
      latest玉利: latest.玉利,
      latest中古相場: latest.中古相場,
      latest超率30000: latest.超率打込?.["30000"] ?? null,
      dataWeeks: weeks.length,
    };
  });

  // ランキング
  const rankings = {
    打込ランキング: [...comparison].sort((a, b) => b.latest打込 - a.latest打込).map((m) => m.name),
    台粗利ランキング: [...comparison].sort((a, b) => b.latest台粗利 - a.latest台粗利).map((m) => m.name),
    玉利ランキング: [...comparison].sort((a, b) => b.latest玉利 - a.latest玉利).map((m) => m.name),
  };

  res.json({ comparison, rankings });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`  GET /insights          - 機種データ & サマリー`);
  console.log(`  GET /insights?machine=エヴァ  - 機種名フィルター`);
  console.log(`  GET /insights?week=3         - 特定週フィルター`);
  console.log(`  GET /insights?metric=打込    - 特定メトリクス`);
  console.log(`  GET /insights/compare        - 機種間比較`);
  console.log(`  GET /expenses.html           - 経費精算アプリ`);
  console.log(`  GET /api/expenses            - 経費一覧API`);
  console.log(`  POST /api/expenses           - 経費登録API`);
  console.log(`  DELETE /api/expenses/:id      - 経費削除API`);
});
