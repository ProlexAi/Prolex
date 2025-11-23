/**
 * dockerClient.ts
 *
 * Ce fichier crée et exporte un client Docker configuré pour communiquer
 * avec le daemon Docker de votre machine.
 *
 * DOCKERODE :
 * - Dockerode est une librairie Node.js qui permet de communiquer avec l'API Docker.
 * - Elle se connecte au daemon Docker via un socket Unix (/var/run/docker.sock).
 * - Ce socket donne un contrôle COMPLET sur Docker (attention à la sécurité !).
 *
 * SÉCURITÉ :
 * - Le montage de /var/run/docker.sock dans un conteneur est puissant mais dangereux.
 * - Toute application ayant accès à ce socket peut créer/modifier/supprimer des conteneurs.
 * - TOUJOURS protéger cette application derrière une authentification en production.
 */

import Docker from 'dockerode';

/**
 * Configuration du client Docker
 *
 * Par défaut, dockerode cherche le socket Docker à /var/run/docker.sock
 * C'est l'emplacement standard sur Linux et dans les conteneurs Docker.
 *
 * Vous pouvez personnaliser le chemin via la variable d'environnement DOCKER_SOCKET
 */
const dockerSocketPath = process.env.DOCKER_SOCKET || '/var/run/docker.sock';

/**
 * Création de l'instance Docker
 *
 * Cette instance sera utilisée partout dans l'application pour
 * communiquer avec Docker (lister conteneurs, démarrer/arrêter, etc.)
 */
const docker = new Docker({
  socketPath: dockerSocketPath
});

/**
 * Log de confirmation au démarrage
 */
console.log(`🐳 Docker client initialized with socket: ${dockerSocketPath}`);

/**
 * Export du client pour utilisation dans d'autres fichiers
 */
export default docker;

/**
 * Types utiles pour TypeScript
 *
 * Ces types facilitent le développement en donnant de l'autocomplétion
 * et de la validation de types.
 */

/**
 * Interface représentant les informations de base d'un conteneur
 */
export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
  ports: Docker.Port[];
  created: number;
}

/**
 * Interface représentant les détails complets d'un conteneur
 */
export interface ContainerDetails {
  id: string;
  name: string;
  image: string;
  state: Docker.ContainerInspectInfo['State'];
  created: string;
  config: Docker.ContainerInspectInfo['Config'];
  hostConfig: Docker.ContainerInspectInfo['HostConfig'];
  networkSettings: Docker.ContainerInspectInfo['NetworkSettings'];
  mounts: any[];
}

/**
 * Interface pour le résultat d'exécution d'une commande
 */
export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode?: number;
}
