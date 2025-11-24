#!/bin/bash

# =====================================================================
# SCRIPT: Create Prolex Modular Ecosystem - FULL AUTO
# =====================================================================
# Description: Crée automatiquement l'organisation GitHub ProlexAi
#              et les 9 repositories avec toute la structure
# Author: Claude Code Assistant
# Date: 2025-11-24
# Version: 1.0
# =====================================================================

set -e  # Exit on error

# =====================================================================
# CONFIGURATION
# =====================================================================

GITHUB_ORG="ProlexAi"
BASE_PATH="$HOME/Workspace/Prolex"
MIGRATION_PATH="$(pwd)/migration-modulaire"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Repositories configuration
declare -A REPOS=(
    ["prolex-core"]="private:Cerveau orchestrateur - Logique centrale d'orchestration Prolex"
    ["prolex-kimmy"]="private:Filtre et classification - Pré-filtrage et classification des requêtes"
    ["prolex-opex"]="private:Workflows n8n et exécution - Bras exécutif avec workflows n8n"
    ["prolex-mcp"]="public:Serveurs MCP - Model Context Protocol servers pour intégrations"
    ["prolex-cli"]="public:Interface CLI - Interface en ligne de commande pour Prolex"
    ["prolex-rag"]="private:Base vectorielle RAG - Retrieval Augmented Generation et knowledge base"
    ["prolex-apps"]="public:Applications desktop - Applications Electron/Node.js"
    ["prolex-infra"]="private:Infrastructure - Infrastructure as Code (Terraform, Docker, Ansible)"
    ["prolex-docs"]="public:Documentation - Documentation technique publique"
)

# Mapping repo name -> README file
declare -A README_FILES=(
    ["prolex-core"]="01-prolex-core-README.md"
    ["prolex-kimmy"]="02-prolex-kimmy-README.md"
    ["prolex-opex"]="03-prolex-opex-README.md"
    ["prolex-mcp"]="04-prolex-mcp-README.md"
    ["prolex-cli"]="05-prolex-cli-README.md"
    ["prolex-rag"]="06-prolex-rag-README.md"
    ["prolex-apps"]="07-prolex-apps-README.md"
    ["prolex-infra"]="08-prolex-infra-README.md"
    ["prolex-docs"]="09-prolex-docs-README.md"
)

# =====================================================================
# FUNCTIONS
# =====================================================================

print_header() {
    echo -e "\n${CYAN}=====================================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}=====================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_prerequisites() {
    print_header "VÉRIFICATION PRÉREQUIS"

    # Check git
    if ! command -v git &> /dev/null; then
        print_error "Git n'est pas installé. Installez-le depuis https://git-scm.com/"
        exit 1
    fi
    print_success "Git installé: $(git --version)"

    # Check gh
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) n'est pas installé."
        echo -e "${YELLOW}Installez-le avec:${NC}"
        echo "  - macOS: brew install gh"
        echo "  - Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
        echo "  - Windows: choco install gh"
        exit 1
    fi
    print_success "GitHub CLI installé: $(gh --version | head -n1)"

    # Check gh authentication
    if ! gh auth status &> /dev/null; then
        print_error "GitHub CLI n'est pas authentifié."
        echo -e "${YELLOW}Authentifiez-vous avec:${NC}"
        echo "  gh auth login"
        exit 1
    fi
    print_success "GitHub CLI authentifié"

    # Get authenticated user
    GH_USER=$(gh api user -q .login)
    print_info "Utilisateur GitHub: $GH_USER"
}

create_organization() {
    print_header "CRÉATION ORGANISATION GITHUB"

    # Check if org exists
    if gh api "orgs/$GITHUB_ORG" &> /dev/null; then
        print_warning "Organisation $GITHUB_ORG existe déjà"
        return 0
    fi

    print_info "Création de l'organisation $GITHUB_ORG..."

    # Note: Creating an org via API requires specific permissions
    # and is not always possible via gh CLI for personal accounts.
    # We'll handle this gracefully.

    if gh api --method POST /user/orgs \
        -f login="$GITHUB_ORG" \
        -f profile_name="Prolex AI" \
        -f description="Prolex - AI Orchestration Platform" &> /dev/null; then
        print_success "Organisation $GITHUB_ORG créée"
    else
        print_warning "Impossible de créer l'organisation automatiquement."
        print_info "Créez l'organisation manuellement sur GitHub:"
        echo "  https://github.com/organizations/plan"
        echo ""
        read -p "Appuyez sur Entrée une fois l'organisation créée..."

        # Verify org exists now
        if ! gh api "orgs/$GITHUB_ORG" &> /dev/null; then
            print_error "Organisation $GITHUB_ORG n'existe toujours pas. Abandon."
            exit 1
        fi
        print_success "Organisation $GITHUB_ORG confirmée"
    fi
}

create_repositories() {
    print_header "CRÉATION DES 9 REPOSITORIES"

    local count=0
    local total=${#REPOS[@]}

    for repo_name in "${!REPOS[@]}"; do
        count=$((count + 1))
        local repo_info="${REPOS[$repo_name]}"
        local visibility="${repo_info%%:*}"
        local description="${repo_info#*:}"

        echo -e "\n${CYAN}[$count/$total] Repository: $repo_name ($visibility)${NC}"

        # Check if repo exists
        if gh repo view "$GITHUB_ORG/$repo_name" &> /dev/null; then
            print_warning "Repository $GITHUB_ORG/$repo_name existe déjà"
            continue
        fi

        # Create repository
        print_info "Création du repository..."

        if [ "$visibility" = "private" ]; then
            gh repo create "$GITHUB_ORG/$repo_name" \
                --private \
                --description "$description" \
                --disable-wiki \
                --disable-issues=false
        else
            gh repo create "$GITHUB_ORG/$repo_name" \
                --public \
                --description "$description" \
                --disable-wiki \
                --disable-issues=false
        fi

        if [ $? -eq 0 ]; then
            print_success "Repository $repo_name créé"
        else
            print_error "Erreur création $repo_name"
            exit 1
        fi

        sleep 1  # Rate limiting
    done

    print_success "\nTous les repositories créés!"
}

setup_local_structure() {
    print_header "SETUP STRUCTURE LOCALE"

    # Create base directory
    mkdir -p "$BASE_PATH"
    print_success "Dossier créé: $BASE_PATH"
}

clone_and_setup_repositories() {
    print_header "CLONE ET SETUP REPOSITORIES"

    local count=0
    local total=${#REPOS[@]}

    cd "$BASE_PATH"

    for repo_name in "${!REPOS[@]}"; do
        count=$((count + 1))

        # Determine folder name (with number prefix)
        local folder_name=""
        case "$repo_name" in
            "prolex-core") folder_name="01-prolex-core" ;;
            "prolex-kimmy") folder_name="02-prolex-kimmy" ;;
            "prolex-opex") folder_name="03-prolex-opex" ;;
            "prolex-mcp") folder_name="04-prolex-mcp" ;;
            "prolex-cli") folder_name="05-prolex-cli" ;;
            "prolex-rag") folder_name="06-prolex-rag" ;;
            "prolex-apps") folder_name="07-prolex-apps" ;;
            "prolex-infra") folder_name="08-prolex-infra" ;;
            "prolex-docs") folder_name="09-prolex-docs" ;;
        esac

        echo -e "\n${CYAN}[$count/$total] Setup: $folder_name${NC}"

        # Clone if not exists
        if [ -d "$folder_name" ]; then
            print_warning "Dossier $folder_name existe déjà"
            cd "$folder_name"
        else
            print_info "Clonage de $GITHUB_ORG/$repo_name..."
            gh repo clone "$GITHUB_ORG/$repo_name" "$folder_name"
            cd "$folder_name"
        fi

        # Copy README
        local readme_file="${README_FILES[$repo_name]}"
        local readme_source="$MIGRATION_PATH/repos/$readme_file"

        if [ -f "$readme_source" ]; then
            print_info "Copie README..."
            cp "$readme_source" README.md

            # Create initial commit
            git add README.md

            if git diff --cached --quiet; then
                print_info "README déjà à jour"
            else
                git commit -m "docs: add initial README

This README provides:
- Project overview and role
- AI-first developer instructions (what/where/how to code)
- Architecture and structure
- Installation and configuration
- Testing and deployment

Repository: $repo_name
Part of Prolex modular architecture migration.
"
                print_success "Commit créé"
            fi

            # Push to GitHub
            print_info "Push vers GitHub..."
            if git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null; then
                print_success "Push réussi"
            else
                # Try to set default branch and push
                git branch -M main
                git push -u origin main
                print_success "Push réussi (branche main créée)"
            fi
        else
            print_warning "README source non trouvé: $readme_file"
        fi

        cd "$BASE_PATH"
        sleep 1
    done

    print_success "\nTous les repositories configurés!"
}

configure_branch_protection() {
    print_header "CONFIGURATION BRANCH PROTECTION"

    print_info "Configuration protection branche 'main'..."

    for repo_name in "${!REPOS[@]}"; do
        echo -e "\n${CYAN}Repository: $repo_name${NC}"

        # Enable branch protection (basic)
        if gh api -X PUT "/repos/$GITHUB_ORG/$repo_name/branches/main/protection" \
            --input - <<EOF 2>/dev/null
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
        then
            print_success "Branch protection configurée pour $repo_name"
        else
            print_warning "Impossible de configurer branch protection pour $repo_name (nécessite admin)"
        fi

        sleep 1
    done
}

create_summary() {
    print_header "RÉSUMÉ DE LA MIGRATION"

    echo -e "${GREEN}🎉 MIGRATION RÉUSSIE !${NC}\n"

    echo -e "${CYAN}Organisation GitHub:${NC}"
    echo "  https://github.com/$GITHUB_ORG"
    echo ""

    echo -e "${CYAN}Repositories créés (9):${NC}"
    for repo_name in prolex-core prolex-kimmy prolex-opex prolex-mcp prolex-cli prolex-rag prolex-apps prolex-infra prolex-docs; do
        local repo_info="${REPOS[$repo_name]}"
        local visibility="${repo_info%%:*}"
        local icon="🔒"
        [ "$visibility" = "public" ] && icon="🔓"
        echo "  $icon https://github.com/$GITHUB_ORG/$repo_name"
    done
    echo ""

    echo -e "${CYAN}Structure locale:${NC}"
    echo "  $BASE_PATH/"
    ls -1 "$BASE_PATH" | sed 's/^/    /'
    echo ""

    echo -e "${CYAN}Prochaines étapes:${NC}"
    echo "  1. Consulter migration-modulaire/docs/IMPLEMENTATION_GUIDE.md"
    echo "  2. Suivre les Phases 3-7 (migration code, CI/CD, tests)"
    echo "  3. Déployer en production"
    echo ""

    print_success "Tous les repositories sont prêts pour le développement!"
}

# =====================================================================
# MAIN SCRIPT
# =====================================================================

main() {
    clear
    print_header "PROLEX MODULAR ECOSYSTEM - FULL AUTO SETUP"

    echo -e "${YELLOW}Ce script va:${NC}"
    echo "  1. Vérifier les prérequis (git, gh)"
    echo "  2. Créer l'organisation GitHub '$GITHUB_ORG' (si nécessaire)"
    echo "  3. Créer 9 repositories (5 privés, 4 publics)"
    echo "  4. Cloner les repos localement dans $BASE_PATH"
    echo "  5. Ajouter les READMEs initiaux"
    echo "  6. Faire les commits et push"
    echo "  7. Configurer branch protection"
    echo ""

    read -p "Continuer? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Abandon."
        exit 0
    fi

    # Execute steps
    check_prerequisites
    create_organization
    create_repositories
    setup_local_structure
    clone_and_setup_repositories
    configure_branch_protection
    create_summary

    echo -e "\n${GREEN}✨ TERMINÉ ! Votre écosystème Prolex modulaire est prêt ! ✨${NC}\n"
}

# Run main
main "$@"
