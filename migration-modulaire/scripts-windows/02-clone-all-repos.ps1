# =====================================================================
# SCRIPT: Clone All Prolex Repositories
# =====================================================================
# Description: Clone les 9 repositories Prolex depuis GitHub
# Author: Claude Code Assistant
# Date: 2025-11-24
# Version: 1.0
# =====================================================================

<#
.SYNOPSIS
    Clone tous les repositories Prolex depuis GitHub.

.DESCRIPTION
    Ce script clone automatiquement les 9 repositories de l'organisation
    ProlexAi depuis GitHub dans le dossier Workspace\Prolex\.

.PARAMETER UseSsh
    Utiliser SSH au lieu de HTTPS pour cloner.

.EXAMPLE
    .\02-clone-all-repos.ps1

.EXAMPLE
    .\02-clone-all-repos.ps1 -UseSsh

.NOTES
    Nécessite Git installé et configuré.
    Pour SSH, nécessite clé SSH configurée sur GitHub.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$UseSsh,

    [Parameter(Mandatory=$false)]
    [string]$BasePath = "$env:USERPROFILE\Workspace\Prolex"
)

# =====================================================================
# CONFIGURATION
# =====================================================================

$ErrorActionPreference = "Stop"

$GithubOrg = "ProlexAi"

$Repositories = @(
    @{
        Name = "prolex-core"
        FolderName = "01-prolex-core"
        Description = "Cerveau orchestrateur"
        Private = $true
    },
    @{
        Name = "prolex-kimmy"
        FolderName = "02-prolex-kimmy"
        Description = "Filtre et classification"
        Private = $true
    },
    @{
        Name = "prolex-opex"
        FolderName = "03-prolex-opex"
        Description = "Workflows n8n et exécution"
        Private = $true
    },
    @{
        Name = "prolex-mcp"
        FolderName = "04-prolex-mcp"
        Description = "Serveurs MCP"
        Private = $false
    },
    @{
        Name = "prolex-cli"
        FolderName = "05-prolex-cli"
        Description = "Interface CLI"
        Private = $false
    },
    @{
        Name = "prolex-rag"
        FolderName = "06-prolex-rag"
        Description = "Base vectorielle RAG"
        Private = $true
    },
    @{
        Name = "prolex-apps"
        FolderName = "07-prolex-apps"
        Description = "Applications desktop"
        Private = $false
    },
    @{
        Name = "prolex-infra"
        FolderName = "08-prolex-infra"
        Description = "Infrastructure"
        Private = $true
    },
    @{
        Name = "prolex-docs"
        FolderName = "09-prolex-docs"
        Description = "Documentation"
        Private = $false
    }
)

# =====================================================================
# FUNCTIONS
# =====================================================================

function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [Parameter(Mandatory=$false)]
        [ValidateSet("Success", "Error", "Info", "Warning")]
        [string]$Type = "Info"
    )

    $colors = @{
        Success = "Green"
        Error = "Red"
        Info = "Cyan"
        Warning = "Yellow"
    }

    $prefix = switch ($Type) {
        "Success" { "✅" }
        "Error" { "❌" }
        "Info" { "ℹ️" }
        "Warning" { "⚠️" }
    }

    Write-Host "$prefix $Message" -ForegroundColor $colors[$Type]
}

function Test-GitInstalled {
    try {
        $null = git --version
        return $true
    }
    catch {
        return $false
    }
}

function Test-GitHubAuth {
    param(
        [bool]$UseSsh
    )

    try {
        if ($UseSsh) {
            # Test SSH
            $output = ssh -T git@github.com 2>&1
            return $output -match "successfully authenticated"
        }
        else {
            # Test HTTPS (gh auth status)
            if (Get-Command gh -ErrorAction SilentlyContinue) {
                $output = gh auth status 2>&1
                return $output -match "Logged in"
            }
            else {
                Write-ColorOutput "GitHub CLI (gh) non installé. Clone HTTPS nécessitera authentification manuelle." -Type Warning
                return $true  # Continue anyway
            }
        }
    }
    catch {
        return $false
    }
}

function Clone-Repository {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Repo,

        [Parameter(Mandatory=$true)]
        [string]$TargetPath,

        [Parameter(Mandatory=$true)]
        [bool]$UseSsh
    )

    $repoName = $Repo.Name
    $folderName = $Repo.FolderName
    $description = $Repo.Description
    $isPrivate = $Repo.Private

    $fullPath = Join-Path -Path $TargetPath -ChildPath $folderName

    # Check if already exists
    if (Test-Path -Path $fullPath) {
        Write-ColorOutput "Existe déjà: $folderName ($description)" -Type Info

        # Check if it's a git repo
        if (Test-Path -Path (Join-Path -Path $fullPath -ChildPath ".git")) {
            # Pull latest
            try {
                Push-Location $fullPath
                git pull origin main 2>&1 | Out-Null
                Write-ColorOutput "  → Mis à jour depuis origin/main" -Type Success
                Pop-Location
            }
            catch {
                Write-ColorOutput "  → Erreur pull: $($_.Exception.Message)" -Type Warning
                Pop-Location
            }
        }
        return $true
    }

    # Clone
    Write-ColorOutput "Clonage: $folderName ($description)" -Type Info

    $cloneUrl = if ($UseSsh) {
        "git@github.com:$GithubOrg/$repoName.git"
    }
    else {
        "https://github.com/$GithubOrg/$repoName.git"
    }

    try {
        git clone $cloneUrl $fullPath 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "  → Cloné avec succès" -Type Success
            return $true
        }
        else {
            Write-ColorOutput "  → Erreur clone (code: $LASTEXITCODE)" -Type Error
            return $false
        }
    }
    catch {
        Write-ColorOutput "  → Erreur: $($_.Exception.Message)" -Type Error
        return $false
    }
}

# =====================================================================
# MAIN SCRIPT
# =====================================================================

function Main {
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host "       CLONE ALL PROLEX REPOSITORIES                " -ForegroundColor Cyan
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host ""

    # Check Git installed
    if (-not (Test-GitInstalled)) {
        Write-ColorOutput "Git n'est pas installé! Installez Git depuis https://git-scm.com/" -Type Error
        exit 1
    }

    Write-ColorOutput "Git: Installé ✅" -Type Success

    # Check GitHub auth
    Write-ColorOutput "Vérification authentification GitHub..." -Type Info
    if (Test-GitHubAuth -UseSsh $UseSsh) {
        Write-ColorOutput "GitHub Auth: OK ✅" -Type Success
    }
    else {
        if ($UseSsh) {
            Write-ColorOutput "Authentification SSH échouée. Configurez votre clé SSH sur GitHub." -Type Warning
        }
        else {
            Write-ColorOutput "Authentification HTTPS non confirmée. Vous devrez peut-être vous authentifier." -Type Warning
        }
    }

    Write-Host ""
    Write-ColorOutput "Base Path: $BasePath" -Type Info
    Write-ColorOutput "Protocol: $(if ($UseSsh) { 'SSH' } else { 'HTTPS' })" -Type Info
    Write-Host ""

    # Create base path if not exists
    if (-not (Test-Path -Path $BasePath)) {
        New-Item -Path $BasePath -ItemType Directory -Force | Out-Null
        Write-ColorOutput "Dossier créé: $BasePath" -Type Success
    }

    # Clone repositories
    $clonedCount = 0
    $skippedCount = 0
    $errorCount = 0

    foreach ($repo in $Repositories) {
        $result = Clone-Repository -Repo $repo -TargetPath $BasePath -UseSsh $UseSsh

        if ($result) {
            $clonedCount++
        }
        else {
            $errorCount++
        }

        Start-Sleep -Milliseconds 500
    }

    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Green
    Write-ColorOutput "Clone terminé!" -Type Success
    Write-Host "Clonés: $clonedCount" -ForegroundColor Green
    Write-Host "Erreurs: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host ""

    if ($clonedCount -gt 0) {
        Write-ColorOutput "Prochaines étapes:" -Type Info
        Write-Host "  1. cd $BasePath\01-prolex-core" -ForegroundColor White
        Write-Host "  2. pnpm install" -ForegroundColor White
        Write-Host "  3. cp .env.example .env" -ForegroundColor White
        Write-Host "  4. Edit .env avec vos valeurs" -ForegroundColor White
        Write-Host ""
    }

    if ($errorCount -gt 0) {
        Write-ColorOutput "Certains repositories n'ont pas pu être clonés. Vérifiez vos permissions GitHub." -Type Warning
    }
}

# Run main
Main
