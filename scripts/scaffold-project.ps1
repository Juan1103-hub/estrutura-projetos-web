<#
.SYNOPSIS
  Cria a estrutura de pastas e specs para um novo projeto web no workspace.

.DESCRIPTION
  - Cria projects/<nome>/ com .gitkeep e .env.example
  - Cria .specs/projects/<nome>/ com STATE.md
  - Copia .specs/_template/* para .specs/projects/<nome>/
  - Atualiza .specs/STATE.md adicionando o projeto na tabela
  - NAO copia template de codigo (isso so apos APROVAR PLANO E INICIAR)

.PARAMETER Nome
  Nome do projeto em kebab-case (ex: meu-app, controle-estoque).

.PARAMETER Descricao
  Descricao curta do projeto (opcional).

.EXAMPLE
  .\scripts\scaffold-project.ps1 -Nome "meu-app" -Descricao "Sistema de gestao de tarefas"

#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string]$Nome,

  [Parameter(Mandatory=$false)]
  [string]$Descricao = ""
)

$ErrorActionPreference = "Stop"

# Validar kebab-case
if ($Nome -notmatch '^[a-z0-9]+(-[a-z0-9]+)*$') {
  Write-Error "Nome '$Nome' invalido. Use kebab-case: ^[a-z0-9]+(-[a-z0-9]+)*$"
  exit 1
}

# Resolver raiz do workspace (uma pasta acima de scripts/)
$workspaceRoot = Resolve-Path -Path (Join-Path $PSScriptRoot "..")
$projectDir   = Join-Path $workspaceRoot "projects\$Nome"
$specsDir     = Join-Path $workspaceRoot ".specs\projects\$Nome"
$templateDir  = Join-Path $workspaceRoot ".specs\_template"
$stateGlobal  = Join-Path $workspaceRoot ".specs\STATE.md"

Write-Host ""
Write-Host "Workspace: $workspaceRoot"
Write-Host "Projeto:   $Nome"
if ($Descricao) { Write-Host "Descricao:$Descricao" }
Write-Host ""

# 1. Criar projects/<nome>/
if (Test-Path $projectDir) {
  Write-Warning "projects/$Nome/ ja existe. Pulando criacao da pasta do projeto."
} else {
  New-Item -ItemType Directory -Path $projectDir -Force | Out-Null
  # .gitkeep com nome do projeto
@"
# Projeto: $Nome
$Descricao
"@ | Set-Content -Path (Join-Path $projectDir ".gitkeep") -Encoding UTF8
  # .env.example vazio
  "# Variaveis de ambiente do projeto $Nome`n# NUNCA commitar valores reais`n" |
    Set-Content -Path (Join-Path $projectDir ".env.example") -Encoding UTF8
  Write-Host "[OK] projects/$Nome/ criado" -ForegroundColor Green
}

# 2. Criar .specs/projects/<nome>/ copiando _template
if (Test-Path $specsDir) {
  Write-Warning ".specs/projects/$Nome/ ja existe. Pulando criacao de specs."
} else {
  New-Item -ItemType Directory -Path $specsDir -Force | Out-Null
  if (Test-Path $templateDir) {
    Copy-Item -Path "$templateDir\*" -Destination $specsDir -Recurse -Force
    Write-Host "[OK] .specs/projects/$Nome/ criado a partir de _template/" -ForegroundColor Green
  } else {
    Write-Warning "_template/ nao encontrado em $templateDir"
    Write-Host "      Criando somente STATE.md placeholder."
  }
}

# 3. Criar/atualizar .specs/projects/<nome>/STATE.md
$stateProjeto = Join-Path $specsDir "STATE.md"
@"
# STATE.md - $Nome

> Project memory: Decisions log (AD-NNN) + Handoff snapshot.
> Mantido pela skill `tlc-spec-driven`.

## Decisions

(vazio - registrar AD-NNN conforme decisoes sao tomadas)

## Handoff

### Current State
- **Fase atual:** Criado (aguardando Discovery)
- **Aguardando:** preenchimento de prd.md / tech-decisions.md / spec.md / tasks.md / sprint-validator.md

### Artifacts
- `.specs/projects/$Nome/prd.md`
- `.specs/projects/$Nome/tech-decisions.md`
- `.specs/projects/$Nome/spec.md`
- `.specs/projects/$Nome/tasks.md`
- `.specs/projects/$Nome/sprint-validator.md`

### Resume Instructions
- Copiar template da pasta de projeto ( apos APROVAR PLANO E INICIAR )
- Nao copiar codigo ainda - somente planejar

## Lessons

(vazio ate Validator registrar licoes)
"@ | Set-Content -Path $stateProjeto -Encoding UTF8
Write-Host "[OK] .specs/projects/$Nome/STATE.md criado" -ForegroundColor Green

# 4. Atualizar .specs/STATE.md (global) adicionando projeto na tabela
if (Test-Path $stateGlobal) {
  $content = Get-Content $stateGlobal -Raw
  $linhaNova = "| $Nome | .specs/projects/$Nome | novo | Em planejamento |`n"
  # Substituir a linha placeholder "(vazio - novos projetos ...)" se presente
  if ($content -match '\| \(vazio') {
    $content = $content -replace '\| \(vazio - novos projetos serao registrados aqui\) \| - \| - \| - \|', $linhaNova.TrimEnd()
  } else {
    # Append antes da ultima linha em branco
    $idx = $content.LastIndexOf("`n")
    if ($idx -gt 0) {
      $content = $content.Substring(0, $idx) + $linhaNova + $content.Substring($idx)
    } else {
      $content = $content + $linhaNova
    }
  }
  Set-Content -Path $stateGlobal -Value $content -Encoding UTF8
  Write-Host "[OK] .specs/STATE.md atualizado" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pronto. Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Preencher .specs/projects/$Nome/prd.md (Discovery + requisitos)"
Write-Host "  2. Para o agente OpenCode: usar /new-project ou /sdd-start"
Write-Host "  3. Apos APROVAR PLANO E INICIAR: copiar template de templates/full/ para projects/$Nome/"
Write-Host ""