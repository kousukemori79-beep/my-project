const express = require("express");
const machines = require("./data/machines.json");

const app = express();
const PORT = process.env.PORT || 3000;

// GET /insights - パチンコ機種ダッシュボード
app.get("/insights", (req, res) => {
  const { machine, week, metric } = req.query;

  let result = machines.machines;
  if (machine) {
    result = result.filter((m) => m.name.includes(machine));
    if (result.length === 0) {
      return res.status(404).json({ error: "機種が見つかりません" });
    }
  }

  if (week) {
    const w = parseInt(week, 10);
    result = result.map((m) => ({
      ...m,
      weekly: m.weekly.filter((wk) => wk.week === w),
    }));
  }

  // 特定のメトリクスのみ返す
  if (metric) {
    const metricData = result.map((m) => ({
      name: m.name,
      day1: m.day1[metric] ?? null,
      weekly: m.weekly.map((w) => ({ week: w.week, [metric]: w[metric] ?? null })),
    }));
    return res.json({ metric, data: metricData });
  }

  // ダッシュボード形式のレスポンス
  const today = new Date().toISOString().split("T")[0];

  const 機種一覧 = result.map((m) => {
    const weeks = m.weekly;
    const latest = weeks.length > 0 ? weeks[weeks.length - 1] : null;
    const first = weeks.length > 0 ? weeks[0] : null;

    // 状態を判定
    let 状態;
    if (weeks.length === 0) {
      状態 = "新台導入";
    } else if (latest && first && latest.打込 / first.打込 > 0.6) {
      状態 = "安定稼働中";
    } else if (latest && first && latest.打込 / first.打込 > 0.4) {
      状態 = "稼働中";
    } else {
      状態 = "稼働低下中";
    }

    // 優先度を判定
    let 優先度;
    if (m.estimatedSales >= 25000) {
      優先度 = "高";
    } else if (weeks.length === 0 || m.estimatedSales >= 6000) {
      優先度 = "中";
    } else {
      優先度 = "低";
    }

    // 直近の動き
    let 直近の動き;
    if (!latest) {
      直近の動き = `${m.releaseDate}発売、初日打込${m.day1.打込.toLocaleString()}・台粗利${m.day1.台粗利.toLocaleString()}`;
    } else {
      const 打込変化 = first ? ((latest.打込 - first.打込) / first.打込 * 100).toFixed(1) : null;
      直近の動き = `第${latest.week}週 打込${latest.打込.toLocaleString()}`;
      if (latest.中古相場) 直近の動き += `、中古相場${Math.round(latest.中古相場 / 10000)}万円`;
      if (打込変化) 直近の動き += `（初週比${打込変化}%）`;
    }

    return {
      機種: m.name,
      状態,
      直近の動き,
      優先度,
      データ週数: weeks.length,
    };
  });

  // 注意が必要な状況
  const 注意事項 = [];
  result.forEach((m) => {
    const weeks = m.weekly;
    if (weeks.length === 0) {
      注意事項.push({ レベル: "注意", 内容: `${m.name}: 週次データ未取得。初動評価が必要。` });
      return;
    }
    const latest = weeks[weeks.length - 1];
    const first = weeks[0];
    const 打込減少率 = (1 - latest.打込 / first.打込) * 100;
    if (打込減少率 > 55) {
      注意事項.push({ レベル: "警告", 内容: `${m.name}: 打込が初週比-${打込減少率.toFixed(1)}%。入替検討タイミング。` });
    }
    if (latest.中古相場 && first.中古相場 && latest.中古相場 / first.中古相場 < 0.5) {
      注意事項.push({ レベル: "注意", 内容: `${m.name}: 中古相場が大幅下落（${Math.round(latest.中古相場 / 10000)}万円）。` });
    }
  });

  // サマリー指標
  const allDay1打込 = result.map((m) => m.day1.打込);
  const allDay1台粗利 = result.map((m) => m.day1.台粗利);
  const サマリー = {
    対象機種数: result.length,
    総推定販売台数: result.reduce((sum, m) => sum + m.estimatedSales, 0),
    初日平均打込: Math.round(allDay1打込.reduce((a, b) => a + b, 0) / allDay1打込.length),
    初日平均台粗利: Math.round(allDay1台粗利.reduce((a, b) => a + b, 0) / allDay1台粗利.length),
  };

  res.json({
    title: `/insights — ${today}（最新）`,
    機種一覧,
    注意事項,
    サマリー,
  });
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
});
