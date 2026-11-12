# Claude Code 設定の共有（Windows PC ⇄ Mac）

このフォルダは、Claude Code のユーザー設定（`~/.claude/` 配下）を **Git で管理し、複数のPCで同じ仕様に揃える**ための仕組みです。Windows PC と Mac の両方に対応しています。

## 何を同期するか

`dotclaude/` フォルダに、以下のファイルの「正本（マスター）」を置いて共有します。

| ファイル | 役割 |
|---|---|
| `settings.json` | モデル・テーマ・権限・環境変数・フックなどの全般設定 |
| `CLAUDE.md` | すべての作業に効く共通指示（例:「日本語で回答する」） |
| `keybindings.json` | キーボードショートカット |

> `dotclaude/` 内の `*.sample.*` は参考用のサンプルです。実際の設定は、下記の `push` 操作で現在使っているPCから取り込みます。

## 同期しないもの（重要）

- **秘密情報（APIキー・トークン・パスワード）は Git に入れません。**
  機密値は `~/.claude/settings.local.json` に置いてください。このファイルは同期対象外（`.gitignore` で除外）で、各PCごとにローカルで管理します。
- `~/.claude.json`（ログイン状態・プロジェクト履歴など、PC固有の状態）は同期しません。

## 使い方

スクリプトは2つの操作を持ちます。

- **push** … このPCの `~/.claude/` の設定を、リポジトリ（`dotclaude/`）へ取り込む（＝このPCを「正」にする）
- **pull** … リポジトリ（`dotclaude/`）の設定を、このPCの `~/.claude/` へ反映する

上書き前に、既存ファイルは自動で `*.bak-日時` としてバックアップされます。

### Mac / Linux

```bash
cd claude-config
chmod +x sync.sh        # 初回のみ
./sync.sh push          # このPCの設定をリポジトリへ取り込む
./sync.sh pull          # リポジトリの設定をこのPCへ反映する
```

### Windows（PowerShell）

```powershell
cd claude-config
# 実行がブロックされる場合は次の形で実行:
#   powershell -ExecutionPolicy Bypass -File .\sync.ps1 push
.\sync.ps1 push         # このPCの設定をリポジトリへ取り込む
.\sync.ps1 pull         # リポジトリの設定をこのPCへ反映する
```

## 推奨ワークフロー（Windows PC を「正」にして始める場合）

現在の設定は Windows PC にあるので、まず Windows を基準にします。

**① Windows PC（現在の正）**
```powershell
git pull                       # リポジトリを最新に
cd claude-config
.\sync.ps1 push                # 現在の設定を dotclaude/ へ取り込む
cd ..
git add claude-config/dotclaude
git commit -m "Update Claude config from Windows PC"
git push
```

**② Mac（新しいPC）**
```bash
git pull                       # ① の内容を取得
cd claude-config
chmod +x sync.sh
./sync.sh pull                 # リポジトリの設定を ~/.claude/ へ反映
```
→ Claude Code を再起動して、モデル・権限・キーバインドが揃っているか確認。

## 日々の運用（どちらのPCでも）

1. 設定を変えたPCで `push` → `git add` → `commit` → `push`
2. もう一方のPCで `git pull` → `pull`（スクリプト）

これで、Windows と Mac のどちらを使っても常に同じ Claude Code 設定を保てます。

## 注意

- `settings.json` は厳密なJSON（コメント不可）です。手で編集する場合は構文に注意してください。
- `push` / `pull` はバックアップを作りますが、重要な変更前には念のため `git status` で差分を確認してください。
- MCPサーバーの定義が `settings.json` に含まれる場合、トークン等の秘密値だけは `settings.local.json`（同期対象外）に分けてください。
