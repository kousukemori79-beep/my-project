# CLAUDE.md

## 言語設定

- すべての返答は日本語で行うこと

## プロジェクト概要

パチンコ機種データの分析・比較APIサーバー。機種ごとの打込、台粗利、玉利、中古相場などのメトリクスを週次で追跡し、インサイトを提供する。

## 技術スタック

- **ランタイム**: Node.js
- **フレームワーク**: Express v5
- **データ**: JSON（`data/machines.json`）
- **エントリポイント**: `index.js`

## プロジェクト構成

```
index.js          - Express APIサーバー（メインエントリポイント）
data/             - 機種データ（JSON）
reports/          - 分析レポート（HTML/PDF）
package.json      - 依存関係・スクリプト定義
```

## コマンド

- **起動**: `npm start`（`node index.js`）
- **テスト**: 未設定

## APIエンドポイント

- `GET /insights` - 機種データ＆サマリー
- `GET /insights?machine=<名前>` - 機種名フィルター
- `GET /insights?week=<数値>` - 特定週フィルター
- `GET /insights?metric=<メトリクス名>` - 特定メトリクス
- `GET /insights/compare` - 機種間比較・ランキング

## コーディング規約

- 既存のコードスタイルに従うこと
- コメントやAPIレスポンスは日本語を使用
- データのキー名（打込、台粗利、玉利など）は日本語をそのまま使用
