# =====================================================================
# SCRIPT: Setup Windows Structure for Prolex Development
# =====================================================================
# Description: Crée la structure de dossiers recommandée pour Prolex
# Author: Claude Code Assistant
# Date: 2025-11-24
# Version: 1.0
# =====================================================================

<#
.SYNOPSIS
    Crée la structure de dossiers Windows pour le développement Prolex.

.DESCRIPTION
    Ce script crée automatiquement l'arborescence complète de dossiers
    pour le développement Prolex, incluant:
    - Workspace (repos GitHub)
    - Automatt (business)
    - Shared-Tools (outils partagés)
    - Archive (anciens fichiers)

.EXAMPLE
    .\01-setup-windows-structure.ps1

.EXAMPLE
    .\01-setup-windows-structure.ps1 -BasePath "C:\Dev"

.NOTES
    Exécuter avec PowerShell 5.1+ en tant qu'utilisateur normal
    (pas besoin d'admin)
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$BasePath = "$env:USERPROFILE"
)

# =====================================================================
# CONFIGURATION
# =====================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$Colors = @{
    Success = "Green"
    Error = "Red"
    Info = "Cyan"
    Warning = "Yellow"
}

# =====================================================================
# FUNCTIONS
# =====================================================================

function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [Parameter(Mandatory=$false)]
        [string]$Type = "Info"
    )

    $color = $Colors[$Type]
    $prefix = switch ($Type) {
        "Success" { "✅" }
        "Error" { "❌" }
        "Info" { "ℹ️" }
        "Warning" { "⚠️" }
    }

    Write-Host "$prefix $Message" -ForegroundColor $color
}

function New-DirectoryIfNotExists {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )

    if (-not (Test-Path -Path $Path)) {
        try {
            New-Item -Path $Path -ItemType Directory -Force | Out-Null
            Write-ColorOutput "Créé: $Path" -Type Success
            return $true
        }
        catch {
            Write-ColorOutput "Erreur création: $Path - $($_.Exception.Message)" -Type Error
            return $false
        }
    }
    else {
        Write-ColorOutput "Existe déjà: $Path" -Type Info
        return $true
    }
}

# =====================================================================
# STRUCTURE DEFINITION
# =====================================================================

$Structure = @{
    "Workspace" = @{
        "Prolex" = @{
            "01-prolex-core" = @{}
            "02-prolex-kimmy" = @{}
            "03-prolex-opex" = @{}
            "04-prolex-mcp" = @{}
            "05-prolex-cli" = @{}
            "06-prolex-rag" = @{}
            "07-prolex-apps" = @{}
            "08-prolex-infra" = @{}
            "09-prolex-docs" = @{}
        }
        "Shared-Tools" = @{
            "AI-Tools" = @{
                "copilot-configs" = @{}
                "claude-configs" = @{}
                "prompts-library" = @{}
            }
            "Scripts" = @{}
            "Configs" = @{}
        }
    }
    "Automatt" = @{
        "Docs" = @{
            "Architecture" = @{}
            "Processes" = @{}
            "Meetings" = @{}
        }
        "Clients" = @{
            "Templates" = @{}
        }
        "Marketing" = @{
            "Content" = @{}
            "Campaigns" = @{}
            "Assets" = @{}
        }
        "Exports" = @{
            "Workflows" = @{}
            "Reports" = @{}
            "Backups" = @{}
        }
        "Templates" = @{
            "Workflow-Templates" = @{}
            "Document-Templates" = @{}
            "Email-Templates" = @{}
        }
    }
    "Archive" = @{
        "2024" = @{}
        "2025" = @{}
        "Migration-Prolex-Monolithe" = @{}
    }
}

# =====================================================================
# MAIN SCRIPT
# =====================================================================

function Main {
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host "  SETUP WINDOWS STRUCTURE FOR PROLEX DEVELOPMENT   " -ForegroundColor Cyan
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host ""

    Write-ColorOutput "Base Path: $BasePath" -Type Info
    Write-Host ""

    # Create structure recursively
    $totalCreated = 0
    $totalSkipped = 0

    function Create-Structure {
        param(
            [Parameter(Mandatory=$true)]
            [hashtable]$Structure,

            [Parameter(Mandatory=$true)]
            [string]$ParentPath
        )

        foreach ($key in $Structure.Keys) {
            $currentPath = Join-Path -Path $ParentPath -ChildPath $key

            if (New-DirectoryIfNotExists -Path $currentPath) {
                $script:totalCreated++
            }
            else {
                $script:totalSkipped++
            }

            # Recurse if has children
            if ($Structure[$key].Count -gt 0) {
                Create-Structure -Structure $Structure[$key] -ParentPath $currentPath
            }
        }
    }

    try {
        Create-Structure -Structure $Structure -ParentPath $BasePath

        Write-Host ""
        Write-Host "=====================================================" -ForegroundColor Green
        Write-ColorOutput "Structure créée avec succès!" -Type Success
        Write-Host "Dossiers créés: $totalCreated" -ForegroundColor Green
        Write-Host "Dossiers existants: $totalSkipped" -ForegroundColor Yellow
        Write-Host "=====================================================" -ForegroundColor Green
        Write-Host ""

        # Create README in Workspace
        $readmePath = Join-Path -Path $BasePath -ChildPath "Workspace\README.md"
        $readmeContent = @"
# Workspace Prolex

> **Zone de développement Prolex**
> **Créé le**: $(Get-Date -Format "yyyy-MM-dd")

## Structure

- **Prolex/**: 9 repositories GitHub clonés
- **Shared-Tools/**: Outils partagés (configs, scripts, prompts)

## Next Steps

1. Cloner les 9 repositories: ``.\clone-all-repos.ps1``
2. Installer dépendances: ``pnpm install`` dans chaque repo
3. Configurer .env files

## Links

- [GitHub Organization](https://github.com/ProlexAi)
- [Documentation](https://docs.prolex.ai)
"@

        Set-Content -Path $readmePath -Value $readmeContent -Encoding UTF8
        Write-ColorOutput "README créé: $readmePath" -Type Success

        Write-Host ""
        Write-ColorOutput "Prochaines étapes:" -Type Info
        Write-Host "  1. Cloner les repositories: .\02-clone-all-repos.ps1" -ForegroundColor White
        Write-Host "  2. Organiser anciens dossiers: .\03-organize-old-files.ps1" -ForegroundColor White
        Write-Host "  3. Nettoyer dossiers Windows: .\04-hide-windows-folders.reg" -ForegroundColor White
        Write-Host ""

    }
    catch {
        Write-ColorOutput "Erreur critique: $($_.Exception.Message)" -Type Error
        exit 1
    }
}

# Run main
Main
