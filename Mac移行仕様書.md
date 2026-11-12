# Mac移行仕様書（Windows PC → 新しいMac）

作成日: 2026-11-12
更新日: 2026-11-12（開発環境・認証まわりの手順を追記した完成版）
目的: 現在使用中のWindows PCと同じ作業環境を、新しいMac上に再現する。

## この仕様書の読み方（Mac側のClaudeへ）

- 本書は、移行元PCのフォルダ名・インストール先フォルダ名から読み取った構成をまとめ、Windows→Mac移行で実際につまずきやすい点を追記したものです。各アプリのバージョン、ライセンス、アプリ内設定までは確認できていません。
- 「要確認」と書いた項目は、作業前にユーザー本人へ確認してください。
- アプリのインストール、アカウントへのサインイン、ライセンス認証はユーザー本人が行います。パスワードやライセンスキーは本書に含めていません。
- 進め方は、第8章の手順の順番を推奨します。初めてMacをセットアップする場合は、手順の「0. 事前準備」から順に進めてください。

## 1. 移行元PCの概要

| 項目 | 内容 |
|---|---|
| OS | Windows（64bit / x64） |
| メーカー | Dell |
| コンピューター名 | DESKTOP-9JIT2SC |
| クラウドストレージ | Dropbox（業務データの大半がここにある） |
| Claude | Claudeデスクトップアプリを使用中（開発用途の場合はClaude Code設定も対象。第5章参照） |

## 2. アプリケーション一覧とMacでの対応

### 2-1. Macにそのまま入れられるもの

| 移行元のアプリ | 用途 | Macでの対応 |
|---|---|---|
| Dropbox | ファイル同期・共有 | Mac版をインストールし、同じアカウントでサインイン |
| Microsoft Office | Word / Excel / PowerPoint など | Mac版Microsoft 365をインストール（契約形態は要確認） |
| Google（Chromeと推定） | ブラウザ | Mac版Chromeをインストールし、Googleアカウントで同期（要確認） |
| Notion | ノート・情報管理 | Mac版をインストールしサインイン（データはクラウド上） |
| Obsidian | ノート | Mac版をインストール。保管庫（Vault）の場所は要確認 |
| Xmind | マインドマップ | Mac版をインストール |
| Vrew | 動画編集・字幕 | Mac版をインストール |
| Adobe製品 | 製品名は要確認（Acrobatの可能性） | Mac版をインストール |
| TeamViewer | リモート接続 | Mac版をインストール。旧PCを残す場合は無人アクセス設定も検討（第3章参照） |
| Claude | AIアシスタント | Mac版デスクトップアプリをインストールしサインイン。開発利用なら第5章も実施 |

### 2-2. 開発ツール

Macでは、まず**パッケージ管理ツール「Homebrew」**を入れておくと、以降の開発ツールの導入・バージョン管理が一気にスムーズになります（第8章 手順1で導入）。

| 移行元のツール | Macでの対応 |
|---|---|
| Homebrew（新規） | 開発ツールの土台。最初にインストール（`brew.sh` の公式手順） |
| Visual Studio Code | Mac版をインストール。設定同期（Settings Sync）で拡張機能と設定を引き継ぐ |
| Git | `xcode-select --install`（Command Line Tools）または `brew install git`。あわせて `~/.gitconfig` とSSHキーを移行（第4章） |
| Node.js | バージョンを揃えるため、素のインストールより **nvm / fnm / volta** 等のバージョン管理ツール経由を推奨（バージョンは要確認。プロジェクトの `.nvmrc` / `package.json` の engines に合わせる） |
| Python | **pyenv** 等でバージョンを合わせるのを推奨（バージョンは要確認） |
| .NET SDK | 必要な場合のみMac版をインストール（使用有無は要確認） |
| Codex（OpenAI） | Macで再インストールしサインイン |
| GitHub Copilot | Macで再インストールしサインイン（VS Code拡張なら設定同期で入ることも） |

### 2-3. Macでは使えない、または代わりが必要なもの

| 移行元のアプリ | 状況 | 対応案 |
|---|---|---|
| Power Automate Desktop | Windows専用 | 自動化している作業の内容を確認し、Macのショートカット等で作り直すか、Windows PCを残す |
| KEYENCEのソフト | Windows専用の可能性が高い | 使用頻度を確認。必要ならWindows PCを残す |
| Microsoft Office 15（Office 2013） | 旧版でMacには無い | Mac版Microsoft 365に一本化 |
| McAfee | Windows版 | Macは標準でGatekeeper等の保護があるため、契約がなければ不要。契約が残る場合のみMac版を確認 |
| Dell関連ソフト、Intel / Qualcomm / Killer / Goodixのドライバ類 | Dell PC専用 | 移行不要 |
| `.bat` / `.ps1` などのWindows用スクリプト | Macでは動かない | シェルスクリプト（`.sh`）等に置き換え（第6章参照） |

### 2-4. プリンター

移行元ではNEC製とBrother製のプリンタードライバが入っています。Macでは、機種名を確認のうえ各メーカーのMac用ドライバを入れるか、AirPrintで接続します（機種名は要確認）。

## 3. リモート接続（TeamViewer）

- 移行後もWindows PCを残す場合、Windows専用ソフト（Power Automate Desktop、KEYENCE等）を遠隔で使えるよう、**Windows側のTeamViewerで無人アクセス（Unattended Access）を設定**しておくと、Macから旧PCに接続できて便利です。
- 設定の有無・固定パスワードの管理方法は要確認。

## 4. 認証情報（Git / GitHub / SSHキー）※移行の要

リポジトリのクローンや push には認証が必要です。サインインだけでは引き継がれないため、以下を忘れずに移行・設定してください。

| 対象 | 内容 | Macでの対応 |
|---|---|---|
| `~/.gitconfig` | Gitのユーザー名・メール・改行設定など | 旧PCの内容を確認し、Macで `git config --global` で設定し直す |
| SSHキー（`~/.ssh/`） | GitHub等への認証鍵 | 旧PCの鍵を安全に移行するか、Macで新規作成（`ssh-keygen`）してGitHubに公開鍵を登録 |
| 資格情報ヘルパー | HTTPS接続時のトークン保存 | macOSのKeychain連携（`osxkeychain`）を設定。Personal Access Tokenが必要な場合は再発行 |

> 注意: SSH秘密鍵・トークンは機密情報です。平文メールやチャットに貼らず、安全な方法（暗号化・パスワードマネージャー・直接コピー等）で移してください。

## 5. Claude（AIアシスタント）の設定移行

デスクトップアプリは「インストール＋サインイン」で使えますが、**Claude Code（開発用のCLI/エディタ連携）を使っている場合、設定はサインインだけでは引き継がれません**。以下を移行すると、各PCで同じ仕様になります。

| ファイル / 設定 | 役割 |
|---|---|
| `~/.claude/settings.json` | モデル・権限・環境変数・フックなど全般設定 |
| `~/.claude/CLAUDE.md` | 共通の指示・メモリ（例:「日本語で回答する」等） |
| `~/.claude/keybindings.json` | キーボードショートカット |
| MCPサーバー設定 | 外部ツール連携の定義（settings内または `.mcp.json`） |
| プラグイン / スキル | 追加機能 |
| プロジェクト内 `.claude/settings.json` | プロジェクト固有の設定 |

- 揃え方のおすすめ: これらをgitリポジトリ（例: 本 `my-project`）で管理し、各PCで `git clone` / `pull` して反映すると、再現性高く同じ環境を保てます。
- 要確認: Claude Codeを使っているか、使っている場合に上記設定ファイルが存在するか。

## 6. 開発プロジェクト移行時の注意（Windows → Mac特有）

Windowsで作った開発プロジェクトをMacに持ってくる際は、以下に注意してください。

- **Windowsパス（`C:\...`）の混入**: コードや設定内の絶対パスはMacで動きません。相対パスやMac形式（`~/...`）に直す。
- **スクリプトの違い**: `.bat` / `.ps1` はMacで動かないため、`.sh` 等に置き換える。
- **改行コード**: WindowsのCRLFとMacのLFの違いでツールが誤動作することがある。Gitの `core.autocrlf` 設定やエディタ設定で統一。
- **ファイル名の大文字小文字**: Windowsは区別しない、Macは設定次第。import等の大文字小文字不一致でエラーになることがある。
- **再インストールが必要な依存物**: `node_modules` 等はコピーせず、Mac側で `npm install`（または該当コマンド）で入れ直す。

## 7. APIキー・環境変数・`.env` ファイル

- Windowsの**環境変数**に入れていたAPIキー等は自動では移りません。Macでは `~/.zshrc`（標準シェルがzshの場合）などに設定し直します。
- プロジェクト内の `.env` ファイルは、安全な方法で移行してください（平文メール等は避ける）。
- 要確認: どのAPIキー・トークンを環境変数／`.env` で使っているか。

## 8. フォルダ構成

ホームフォルダ直下の構成と、Macでの置き場所です。

| 移行元（Windows） | Macでの置き場所 | 備考 |
|---|---|---|
| Desktop | ~/Desktop | 「my-project」フォルダあり |
| Documents | ~/Documents | 「Codex」フォルダあり |
| Dropbox | ~/Dropbox または ~/Library/CloudStorage/Dropbox | Dropboxアプリが自動作成。構成により場所が変わる（下記参照） |
| Music / Videos | ~/Music / ~/Movies | 中身がある場合のみ移行 |
| my-app | ~/my-app | 開発用フォルダ。中身は要確認 |
| Favorites / Contacts / 3D Objects / Saved Games / Searches / Links | 移行不要 | Windows固有のフォルダ |

### Dropboxについて

- 業務データ（契約書、請求書、経費、プレゼン資料、各社との共有フォルダなど）はDropbox内にあり、フォルダ数は80以上あります。
- MacでDropboxにサインインすれば、フォルダ構成ごと同じ形で復元されます。手作業でのコピーは不要です。
- **保存場所に注意**: 近年のDropboxは `~/Dropbox` ではなく `~/Library/CloudStorage/Dropbox` を使う構成があります。プロジェクトやObsidian保管庫がDropbox内を**絶対パスで参照**していると、場所が変わってリンク切れする可能性があります。移行後にパスを確認してください。
- 「【共有】」で始まるフォルダは他者との共有フォルダです。移動・改名・削除をすると相手側にも影響するため、Mac側で構成を変更しないでください。
- Windows側のDropboxにPCバックアップ（「My PC (DESKTOP-9JIT2SC)」）とカメラアップロードのフォルダがあります。Macで同じバックアップ機能を有効にするかは要確認です。

## 9. データ移行の方法

| データ | 方法 |
|---|---|
| Dropbox内のファイル | Dropboxの同期に任せる |
| Desktop / Documents / my-app | Dropbox経由、外付けドライブ、またはAppleの「移行アシスタント」でコピー |
| 開発プロジェクト（my-app、my-project） | Gitリポジトリがあればクローンし直す（第4章の認証が前提）。無ければフォルダごとコピーし、node_modules等は再インストール |
| ブラウザのブックマーク・パスワード | ブラウザのアカウント同期 |
| Notion | サインインのみ |
| Obsidian | 保管庫フォルダをコピー（Dropbox内にあれば自動） |
| VS Code | 設定同期を両方のPCで有効にする |
| Claude Code設定 | 第5章の設定ファイルを移行（gitでの管理を推奨） |
| 認証情報（SSH/トークン/環境変数） | 第4章・第7章に従って安全に移行 |

## 10. ユーザーに確認が必要な事項

1. メールソフトは何を使っているか（Outlook、ブラウザのGmailなど）
2. Microsoft Officeの契約形態（Microsoft 365か、買い切り版か）
3. Adobeの製品名と契約
4. Power Automate DesktopとKEYENCEソフトを現在も使っているか
5. プリンターの機種名
6. Node.js / Pythonのバージョン指定の有無と、my-app・my-projectの内容
7. Obsidianの保管庫の場所（Dropbox内かどうか）
8. 日本語入力、Dock、デスクトップ表示など、見た目・操作の希望（Win/Macのキー操作の違いを含む）
9. 移行後もWindows PCを残すかどうか（残す場合はTeamViewer無人アクセス）
10. Claude Codeを使っているか、使っている場合の設定ファイルの有無（第5章）
11. GitHubの認証方式（SSHキーかトークンか）と、鍵の移行方針（第4章）
12. 環境変数・`.env` で管理しているAPIキー・トークンの有無（第7章）

## 11. 推奨する作業手順

0. **事前準備**: macOSを最新に更新し、Apple Accountでサインインする
1. **土台づくり**: Homebrewをインストールする（以降の開発ツール導入が楽になる）
2. **クラウド同期**: Dropboxをインストールしてサインインし、同期完了を待つ
3. **ブラウザ**: Chrome等を入れてアカウント同期する
4. **業務アプリ**: Microsoft Office、Notion、Obsidian、Xmind、Vrew、Adobe製品、TeamViewerを入れる
5. **開発ツール**: VS Code、Git、Node.js（バージョン管理ツール経由）、Python、Codex、Copilotを入れる
6. **認証設定**: `~/.gitconfig`・SSHキー／トークンを設定し、GitHubへ接続できる状態にする（第4章）
7. **Claude設定**: デスクトップアプリをサインイン。Claude Codeを使う場合は設定ファイルを移行（第5章）
8. **データ移行**: Desktop / Documents / my-app のデータをコピー。開発プロジェクトはクローン or コピー＋依存再インストール
9. **環境変数**: APIキー・`.env` を安全に設定し直す（第7章）
10. **プリンター**: 機種を確認して設定する
11. **仕上げ**: 第10章の確認事項を反映し、Windows専用ソフトの代替を決める
12. **動作確認**: 主なファイルが開けること、各アプリにサインインできていること、プロジェクトがビルド／実行できることを確認する

## 12. 本書に含まれていない情報

- 各アプリの正確なバージョンとアプリ内の設定
- アカウント情報、パスワード、ライセンスキー、SSH秘密鍵、APIキー等の機密情報
- Microsoft Store経由で入れたアプリ
- ブラウザの拡張機能、メール設定、Wi-Fi・VPN設定
- 環境変数・`.env` に格納している具体的な値（第7章で移行方針のみ記載）
