#!/usr/bin/env python3
"""
Workflow Filter Tool
====================
Outil de filtrage et tri des workflows Opex depuis config/opex_workflows.yml

Permet de filtrer les workflows par :
- biz_area (domaine métier : GE, PROD, MKT, GP, SYS, MULTI)
- category (catégorie technique : core, productivity, dev, clients, monitoring, etc.)
- status (planned, mvp, prod, deprecated)
- scope (internal, client)

Permet de trier par :
- id (par défaut, tri croissant)
- priority (tri décroissant, workflows sans priority en dernier)
- calls_7d (futur : fréquence 7 derniers jours)
- calls_30d (futur : fréquence 30 derniers jours)

Usage:
    python tools/filter_workflows.py
    python tools/filter_workflows.py --biz_area=PROD --status=mvp
    python tools/filter_workflows.py --category=monitoring --biz_area=SYS
    python tools/filter_workflows.py --sort=priority

Dépendances:
    pip install pyyaml
"""

import argparse
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import yaml
except ImportError:
    print("Error: pyyaml is not installed.")
    print("Please install it with: pip install pyyaml")
    sys.exit(1)


# ============================================================================
# CONFIGURATION
# ============================================================================

# Chemin vers le fichier de configuration principal (relatif à la racine du repo)
CONFIG_FILE = "config/opex_workflows.yml"

# Chemin vers le fichier de cache des stats d'utilisation (futur)
USAGE_CACHE_FILE = "config/opex_usage_cache.yml"


# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

def find_repo_root() -> Path:
    """Trouve la racine du repository en cherchant le dossier .git"""
    current = Path(__file__).resolve().parent
    while current != current.parent:
        if (current / ".git").exists():
            return current
        current = current.parent
    # Fallback : répertoire parent du script
    return Path(__file__).resolve().parent.parent


def load_yaml_file(file_path: Path) -> Optional[Dict[str, Any]]:
    """Charge un fichier YAML et retourne son contenu"""
    if not file_path.exists():
        return None

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except yaml.YAMLError as e:
        print(f"Error: Failed to parse YAML file {file_path}")
        print(f"  {e}")
        return None


def validate_biz_area(biz_area: str, valid_biz_areas: List[str]) -> bool:
    """Valide qu'un biz_area est dans la liste des codes valides"""
    return biz_area in valid_biz_areas


def get_display_value(workflow: Dict[str, Any], key: str, default: str = "N/A") -> str:
    """Récupère la valeur d'un champ du workflow, avec fallback sur 'N/A'"""
    value = workflow.get(key)
    if value is None or value == "":
        return default
    return str(value)


# ============================================================================
# FILTRAGE ET TRI
# ============================================================================

def filter_workflows(
    workflows: List[Dict[str, Any]],
    biz_area: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    scope: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Filtre les workflows selon les critères fournis"""
    filtered = workflows

    if biz_area:
        filtered = [w for w in filtered if w.get("biz_area") == biz_area]

    if category:
        filtered = [w for w in filtered if w.get("category") == category]

    if status:
        filtered = [w for w in filtered if w.get("status") == status]

    if scope:
        filtered = [w for w in filtered if w.get("scope") == scope]

    return filtered


def sort_workflows(
    workflows: List[Dict[str, Any]],
    sort_by: str,
    usage_stats: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """Trie les workflows selon le critère spécifié"""

    if sort_by == "id":
        # Tri par ID croissant
        return sorted(workflows, key=lambda w: w.get("id", 0))

    elif sort_by == "priority":
        # Tri par priorité décroissante (workflows sans priority en dernier)
        def priority_key(w):
            priority = w.get("priority")
            if priority is None:
                return -1  # Les workflows sans priority vont à la fin
            return priority

        return sorted(workflows, key=priority_key, reverse=True)

    elif sort_by == "calls_7d":
        # Tri par nombre d'appels sur 7 jours (décroissant)
        if usage_stats is None:
            print("\nWarning: Usage stats file not found or empty. Sorting by calls_7d not possible.")
            print(f"  Expected file: {USAGE_CACHE_FILE}")
            print("  Falling back to sort by ID.\n")
            return sort_workflows(workflows, "id")

        def calls_7d_key(w):
            wf_id = str(w.get("id", ""))
            stats = usage_stats.get("usage_stats", {}).get(wf_id, {})
            return stats.get("calls_last_7d", 0)

        return sorted(workflows, key=calls_7d_key, reverse=True)

    elif sort_by == "calls_30d":
        # Tri par nombre d'appels sur 30 jours (décroissant)
        if usage_stats is None:
            print("\nWarning: Usage stats file not found or empty. Sorting by calls_30d not possible.")
            print(f"  Expected file: {USAGE_CACHE_FILE}")
            print("  Falling back to sort by ID.\n")
            return sort_workflows(workflows, "id")

        def calls_30d_key(w):
            wf_id = str(w.get("id", ""))
            stats = usage_stats.get("usage_stats", {}).get(wf_id, {})
            return stats.get("calls_last_30d", 0)

        return sorted(workflows, key=calls_30d_key, reverse=True)

    else:
        # Sort par défaut : ID
        return sort_workflows(workflows, "id")


# ============================================================================
# AFFICHAGE
# ============================================================================

def display_workflows(
    workflows: List[Dict[str, Any]],
    valid_biz_areas: List[str]
):
    """Affiche les workflows filtrés dans un format lisible"""

    if not workflows:
        print("\nAucun workflow trouvé pour ces critères.\n")
        return

    print(f"\n{len(workflows)} workflow(s) trouvé(s):\n")
    print("=" * 120)

    for workflow in workflows:
        wf_id = workflow.get("id", "N/A")
        name = workflow.get("name", "N/A")
        category = workflow.get("category", "N/A")
        biz_area = get_display_value(workflow, "biz_area")
        status = workflow.get("status", "N/A")
        scope = workflow.get("scope", "N/A")
        priority = get_display_value(workflow, "priority")

        # Validation du biz_area
        if biz_area != "N/A" and not validate_biz_area(biz_area, valid_biz_areas):
            print(f"Warning: biz_area inconnu '{biz_area}' pour le workflow ID {wf_id}")

        # Affichage de la ligne du workflow
        print(
            f"ID: {wf_id:3} | "
            f"Name: {name:35} | "
            f"Cat: {category:12} | "
            f"Biz: {biz_area:6} | "
            f"Status: {status:10} | "
            f"Scope: {scope:8} | "
            f"Priority: {priority}"
        )

    print("=" * 120)
    print()


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Point d'entrée principal du script"""

    # Parse des arguments en ligne de commande
    parser = argparse.ArgumentParser(
        description="Filtre et trie les workflows Opex depuis config/opex_workflows.yml",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples d'utilisation:
  # Lister tous les workflows
  python tools/filter_workflows.py

  # Workflows de production (PROD) en status MVP
  python tools/filter_workflows.py --biz_area=PROD --status=mvp

  # Workflows de monitoring système
  python tools/filter_workflows.py --category=monitoring --biz_area=SYS

  # Trier par priorité (importance / usage estimé)
  python tools/filter_workflows.py --sort=priority

  # Workflows clients en production
  python tools/filter_workflows.py --category=clients --status=prod
        """
    )

    parser.add_argument(
        "--biz_area",
        type=str,
        help="Filtrer par domaine métier (ex: GE, PROD, MKT, GP, SYS, MULTI)"
    )

    parser.add_argument(
        "--category",
        type=str,
        help="Filtrer par catégorie technique (ex: core, productivity, dev, clients, monitoring, etc.)"
    )

    parser.add_argument(
        "--status",
        type=str,
        help="Filtrer par statut (ex: planned, mvp, prod, deprecated)"
    )

    parser.add_argument(
        "--scope",
        type=str,
        help="Filtrer par portée (ex: internal, client)"
    )

    parser.add_argument(
        "--sort",
        type=str,
        default="id",
        choices=["id", "priority", "calls_7d", "calls_30d"],
        help="Critère de tri (défaut: id)"
    )

    args = parser.parse_args()

    # Trouver la racine du repository
    repo_root = find_repo_root()
    config_path = repo_root / CONFIG_FILE
    usage_cache_path = repo_root / USAGE_CACHE_FILE

    # Charger le fichier de configuration
    if not config_path.exists():
        print(f"Error: Configuration file not found: {config_path}")
        print(f"Please ensure you are running this script from the repository root.")
        sys.exit(1)

    config = load_yaml_file(config_path)
    if config is None:
        sys.exit(1)

    # Extraire les données
    workflows = config.get("workflows", [])
    biz_areas_config = config.get("biz_areas", {})
    valid_biz_areas = list(biz_areas_config.keys())

    if not workflows:
        print("Warning: No workflows found in configuration file.")
        sys.exit(0)

    # Charger les stats d'utilisation (si disponibles)
    usage_stats = None
    if args.sort in ["calls_7d", "calls_30d"]:
        usage_stats = load_yaml_file(usage_cache_path)

    # Filtrer les workflows
    filtered_workflows = filter_workflows(
        workflows,
        biz_area=args.biz_area,
        category=args.category,
        status=args.status,
        scope=args.scope
    )

    # Trier les workflows
    sorted_workflows = sort_workflows(
        filtered_workflows,
        sort_by=args.sort,
        usage_stats=usage_stats
    )

    # Afficher les workflows
    display_workflows(sorted_workflows, valid_biz_areas)


if __name__ == "__main__":
    main()
