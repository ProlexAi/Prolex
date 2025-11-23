/**
 * Script d'exemple montrant comment utiliser runWithProlexLogger
 * avec un appel à un workflow n8n
 */

import axios from "axios";
import { runWithProlexLogger } from "../src/runWithProlexLogger";

/**
 * Interface pour le payload d'un workflow n8n de test
 */
interface N8nTestPayload {
  message: string;
  userId?: string;
  timestamp?: string;
}

/**
 * Interface pour la réponse d'un workflow n8n
 */
interface N8nTestResponse {
  success: boolean;
  data: any;
  executionId?: string;
}

/**
 * Fonction principale de démonstration
 */
async function main() {
  console.log("🚀 Exemple d'utilisation de prolex-run-logger avec n8n\n");

  // Préparer le payload d'entrée
  const input: N8nTestPayload = {
    message: "Test du logger Prolex",
    userId: "user_123",
    timestamp: new Date().toISOString(),
  };

  console.log("📥 Input:", JSON.stringify(input, null, 2));
  console.log();

  try {
    // Exécuter avec le logger Prolex
    const result = await runWithProlexLogger<N8nTestPayload, N8nTestResponse>({
      context: {
        nomAgent: "kimmy_n8n",
        typeCible: "workflow_n8n",
        flowId: "test-workflow-1234",
        meta: {
          scenario: "test_sandbox",
          environment: "development",
          version: "1.0.0",
        },
      },
      input,
      execute: async (payload) => {
        // Simuler un appel à n8n
        // Dans un vrai cas, remplacer par votre URL de webhook n8n
        console.log("🔄 Exécution du workflow n8n...");

        // Exemple avec un vrai appel n8n (décommenter et adapter l'URL)
        /*
        const response = await axios.post(
          "http://localhost:5678/webhook/test",
          payload,
          {
            timeout: 30000,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
        */

        // Simulation pour la démo
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simuler une réponse réussie
        return {
          success: true,
          data: {
            processed: payload.message,
            userId: payload.userId,
            processedAt: new Date().toISOString(),
          },
          executionId: "exec_" + Math.random().toString(36).substring(7),
        };
      },
    });

    // Afficher les résultats
    console.log();
    console.log("📊 Résultat de l'exécution:");
    console.log("  - Run ID:", result.runId);
    console.log("  - Durée:", result.dureeMs, "ms");
    console.log("  - Erreur:", result.error ? "Oui" : "Non");

    if (result.error) {
      console.log("  - Message d'erreur:", result.error.message || result.error);
    } else {
      console.log("  - Output:", JSON.stringify(result.output, null, 2));
    }

    console.log();
    console.log("✅ Les logs ont été écrits dans:");
    console.log("  - ./logs/prolex_runs.jsonl (tous les runs)");
    if (result.error) {
      console.log("  - ./logs/prolex_errors.jsonl (erreurs uniquement)");
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution:", error);
    process.exit(1);
  }
}

/**
 * Exemple avec une erreur simulée
 */
async function exampleWithError() {
  console.log("\n🔥 Exemple avec simulation d'erreur\n");

  const input = {
    message: "Test avec erreur",
    forceError: true,
  };

  const result = await runWithProlexLogger({
    context: {
      nomAgent: "prolex_principal",
      typeCible: "agent",
      meta: {
        scenario: "test_error_handling",
      },
    },
    input,
    execute: async (payload: any) => {
      // Simuler une erreur
      throw new Error("Erreur simulée pour tester le logging");
    },
  });

  console.log("📊 Résultat (avec erreur):");
  console.log("  - Run ID:", result.runId);
  console.log("  - Durée:", result.dureeMs, "ms");
  console.log("  - A une erreur:", !!result.error);
  console.log("  - Message:", result.error?.message);

  console.log();
  console.log("✅ L'erreur a été loggée dans ./logs/prolex_errors.jsonl");
}

// Point d'entrée
if (require.main === module) {
  main()
    .then(() => exampleWithError())
    .then(() => {
      console.log("\n✨ Exemples terminés avec succès !");
    })
    .catch((error) => {
      console.error("\n❌ Erreur fatale:", error);
      process.exit(1);
    });
}
