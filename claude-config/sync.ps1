<#
  Claude Code 設定を Git リポジトリ(dotclaude/) と %USERPROFILE%\.claude の間で同期する (Windows / PowerShell)

  使い方:
    .\sync.ps1 push   # ~/.claude -> リポジトリ (このPCの設定を"正"としてリポジトリへ取り込む)
    .\sync.ps1 pull   # リポジトリ -> ~/.claude (リポジトリの設定をこのPCへ反映する)

  実行がブロックされる場合:
    powershell -ExecutionPolicy Bypass -File .\sync.ps1 push

  秘密情報を含む settings.local.json と、PC固有の .claude.json は同期しません。
#>

param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("push", "pull")]
  [string]$Command
)

$ErrorActionPreference = "Stop"

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoClaude = Join-Path $ScriptDir "dotclaude"
$HomeClaude = Join-Path $env:USERPROFILE ".claude"

# 同期対象ファイル (秘密情報を含む settings.local.json は意図的に除外)
$Files = @("settings.json", "CLAUDE.md", "keybindings.json")
$ts = Get-Date -Format "yyyyMMdd-HHmmss"

function Backup-File($path) {
  if (Test-Path $path) {
    Copy-Item $path "$path.bak-$ts"
    Write-Host "  backup: $path -> $(Split-Path -Leaf $path).bak-$ts"
  }
}

if ($Command -eq "push") {
  New-Item -ItemType Directory -Force -Path $RepoClaude | Out-Null
  foreach ($f in $Files) {
    $src = Join-Path $HomeClaude $f
    $dst = Join-Path $RepoClaude $f
    if (Test-Path $src) {
      Backup-File $dst
      Copy-Item $src $dst -Force
      Write-Host "pushed: ~/.claude/$f -> dotclaude/$f"
    }
    else {
      Write-Host "skip (not found): ~/.claude/$f"
    }
  }
  Write-Host ""
  Write-Host "完了。次を実行してリポジトリへ反映してください:"
  Write-Host "  git add claude-config/dotclaude; git commit -m `"Update Claude config`"; git push"
}
elseif ($Command -eq "pull") {
  New-Item -ItemType Directory -Force -Path $HomeClaude | Out-Null
  foreach ($f in $Files) {
    $src = Join-Path $RepoClaude $f
    $dst = Join-Path $HomeClaude $f
    if (Test-Path $src) {
      Backup-File $dst
      Copy-Item $src $dst -Force
      Write-Host "pulled: dotclaude/$f -> ~/.claude/$f"
    }
    else {
      Write-Host "skip (not in repo): dotclaude/$f"
    }
  }
  Write-Host ""
  Write-Host "完了。Claude Code を再起動して設定を確認してください。"
}
