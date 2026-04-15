# CLAUDE.md

## Project Overview

パチンコ機種データの分析・比較APIサーバー。機種ごとの打込、台粗利、玉利、中古相場などの週次データを提供し、トレンド分析や機種間比較を行う。

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5.x
- **Data**: 静的JSONファイル (`data/machines.json`)
- **Language**: JavaScript (CommonJS)

## Project Structure

```
index.js            - Express APIサーバー (エントリーポイント)
data/machines.json  - パチンコ機種データ (週次統計含む)
reports/            - レポートファイル (HTML/PDF)
```

## API Endpoints

- `GET /insights` - 機種データ & サマリー (クエリ: `machine`, `week`, `metric`)
- `GET /insights/compare` - 機種間比較 & ランキング

## Common Commands

- Start: `npm start` (port 3000)
- Test: テストフレームワーク未設定

## Coding Conventions

- 日本語のコメント・変数名を使用 (データフィールド: 打込, 台粗利, 玉利 等)
- CommonJS (`require` / `module.exports`)
- データフィールド名はそのまま日本語を維持すること
