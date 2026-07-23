<#
.SYNOPSIS
  Validoes pre-commit para o workspace padrao OpenCode.

.DESCRIPTION
  Script de verificoes rodar antes de commit:
  - opencode.json e JSON valido e tem $schema
  - skills em .opencode/skills/*/SKILL.md tem frontmatter name+description
  - regras em rules/*.md existem (sao referenciadas via glob)
  - nenhum .env, service_role, chave API ou PII visivel no stage atual

  Nao bloqueia, apenas reporta. Para tornar bloqueante, retornar exit 1 em checks criticos.

.PARAMETER Install
  Instala o script como hook pre-commit do git (cria .git/hooks/pre-commit).

.EXAMPLE
  .\scripts\pre-commit-checks.ps1

.EXAMPLE
  .\scripts\pre-commit-checks.ps1 -Install
#>
[CmdletBinding()]
param(
  [switch]$Install
)

$ErrorActionPreference = "Continue"
$failCount = 0
$warnCount = 0

function Write-Check($ok, $msg, $severity = "error") {
  if ($ok) {
    Write-Host "  [OK]   $msg" -ForegroundColor Green
  } else {
    if ($severity -eq "error") {
      Write-Host "  [FAIL] $msg" -ForegroundColor Red
      $script:failCount++
    } else {
      Write-Host "  [WARN] $msg" -ForegroundColor Yellow
      $script:warnCount++
    }
  }
}

# Instalar como hook do git
if ($Install) {
  $hookPath = ".git\hooks\pre-commit"
  $hookBody = @'
#!/bin/sh
# Hook pre-commit -> chama script de checks do workspace
powershell -ExecutionPolicy Bypass -File "`$PSScriptRoot\..\..\scripts\pre-commit-checks.ps1"
exit 0
'@
  # Windows PowerShell hook
  $hookBodyWin = @'
powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\..\..\scripts\pre-commit-checks.ps1"
'@
  Set-Content -Path $hookPath -Value $hookBodyWin -Encoding UTF8
  Write-Host "Hook pre-commit instalado em $hookPath" -ForegroundColor Cyan
  exit 0
}

Write-Host ""
Write-Host "Pre-commit checks: workspace web OpenCode" -ForegroundColor Cyan
Write-Host "=" * 60

# 1. opencode.json valido
Write-Host "`n[1] opencode.json"
$configPath = "opencode.json"
$ok = Test-Path $configPath
Write-Check $ok "Arquivo existe"
if ($ok) {
  try {
    $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
    Write-Check ($null -ne $cfg.'$schema') "Tem `$schema"
    Write-Check ($null -ne $cfg.instructions) "Tem instructions"
    Write-Check ($null -ne $cfg.permission) "Tem permission"
  } catch {
    Write-Check $false "JSON parse: $($_.Exception.Message)"
  }
}

# 2. Skills com frontmatter
Write-Host "`n[2] Skills .opencode/skills/*/SKILL.md"
$skillPaths = Get-ChildItem -Path ".opencode\skills" -Recurse -Filter "SKILL.md" -ErrorAction SilentlyContinue
$ok = ($skillPaths.Count -gt 0)
Write-Check $ok "$($skillPaths.Count) skills encontradas"
foreach ($sk in $skillPaths) {
  $content = Get-Content $sk.FullName -Raw
  $hasName = $content -match '(?m)^name:\s*(.+)$'
  $hasDesc = $content -match '(?m)^description:\s*(.+)$'
  if (-not $hasName -or -not $hasDesc) {
    Write-Check $false "$($sk.Directory.Name) falta name/description" "warn"
  }
}

# 3. Regras referenciadas existem
Write-Host "`n[3] rules/*.md"
$rules = Get-ChildItem -Path "rules" -Filter "*.md" -ErrorAction SilentlyContinue
$ok = ($rules.Count -ge 16)
Write-Check $ok "$($rules.Count) regras em rules/"
$esperadas = @("code-style.md","testing.md","accessibility.md","security-secrets.md","stack-selection.md","domain-routing.md")
foreach ($r in $esperadas) {
  Write-Check (Test-Path "rules\$r") "rules/$r existe"
}

# 4. Segredos no stage atual
Write-Host "`n[4] Segredos visiveis no stage"
$staged = git diff --cached --name-only 2>$null
$piis   = @("(?i)service_role", "(?i)supabase_service", "(?i)secret_key", "(?i)api_key=sk-", "sk-[a-zA-Z0-9]{20,}")
$bads   = @()
foreach ($f in $staged) {
  if (Test-Path $f) {
    $c = Get-Content $f -Raw -ErrorAction SilentlyContinue
    if ($c) {
      foreach ($p in $piis) {
        if ($c -match $p) { $bads += "$f (match: $p)" }
      }
    }
  }
}
if ($bads.Count -gt 0) {
  Write-Check $false "$($bads.Count) arquivos com padrao suspeito:"
  $bads | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
  $failCount++
} else {
  Write-Check $true "Nenhum padrao suspeito de segredo em stage"
}

# 5. .env nunca deve ser commitado
Write-Host "`n[5] .env e credenciais"
$dotEnvStaged = ($staged | Where-Object { $_ -match '^\.(env|env\..*)$' -or $_ -match '\.env$' })
if ($dotEnvStaged) {
  Write-Check $false ".env em stage: $($dotEnvStaged -join ', ')"
  $failCount++
} else {
  Write-Check $true "Nenhum .env em stage"
}

# Resumo
Write-Host "`n" + ("=" * 60)
if ($failCount -gt 0) {
  Write-Host "RESULTADO: FALHOU ($($failCount) checks criticos)" -ForegroundColor Red
  exit 1
} elseif ($warnCount -gt 0) {
  Write-Host "RESULTADO: OK com avisos ($warnCount warnings)" -ForegroundColor Yellow
  exit 0
} else {
  Write-Host "RESULTADO: OK (todos checks passaram)" -ForegroundColor Green
  exit 0
}