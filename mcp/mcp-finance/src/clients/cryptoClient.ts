/**
 * Client Crypto pour tracking des cryptomonnaies
 * Utilise CoinGecko API (gratuite)
 */

import axios from 'axios';
import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import type { PortfolioCrypto, ActifCrypto, PrixCrypto } from '../types/index.js';

class CryptoClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.coingecko.baseUrl;
    this.apiKey = config.coingecko.apiKey;
    journal.info('Client Crypto (CoinGecko) initialisé');
  }

  /**
   * Obtenir le prix actuel d'une crypto
   */
  async obtenirPrix(
    symbole: string,
    devise: string = 'eur',
    correlationId?: string
  ): Promise<PrixCrypto> {
    try {
      // Mapper les symboles communs
      const coinId = this.mapSymboleToCoinId(symbole);

      const response = await axios.get(`${this.baseUrl}/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
        },
        headers: this.apiKey ? { 'x-cg-pro-api-key': this.apiKey } : {},
      });

      const data = response.data;
      const marketData = data.market_data;

      const prixCrypto: PrixCrypto = {
        symbole: data.symbol.toUpperCase(),
        nom: data.name,
        prix: marketData.current_price[devise.toLowerCase()] || 0,
        devise: devise.toUpperCase(),
        variation24h: marketData.price_change_percentage_24h || 0,
        variation7j: marketData.price_change_percentage_7d || 0,
        volumeMarche: marketData.total_volume[devise.toLowerCase()] || 0,
        capitalisationMarche: marketData.market_cap[devise.toLowerCase()] || 0,
        dernierMAJ: new Date().toISOString(),
      };

      journal.debug('Prix crypto récupéré', {
        symbole: prixCrypto.symbole,
        prix: prixCrypto.prix,
        correlationId,
      });

      return prixCrypto;
    } catch (error) {
      journal.error('crypto_get_price_error', error as Error, { correlationId, symbole });
      throw new Error(`Impossible de récupérer le prix de ${symbole}: ${(error as Error).message}`);
    }
  }

  /**
   * Obtenir plusieurs prix en une fois
   */
  async obtenirPrixMultiples(
    symboles: string[],
    devise: string = 'eur',
    correlationId?: string
  ): Promise<PrixCrypto[]> {
    try {
      const coinIds = symboles.map(s => this.mapSymboleToCoinId(s)).join(',');

      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: coinIds,
          vs_currencies: devise.toLowerCase(),
          include_24hr_change: true,
          include_7d_change: true,
          include_market_cap: true,
          include_24hr_vol: true,
        },
        headers: this.apiKey ? { 'x-cg-pro-api-key': this.apiKey } : {},
      });

      const results: PrixCrypto[] = [];
      const data = response.data;

      for (const [coinId, priceData] of Object.entries(data as Record<string, any>)) {
        results.push({
          symbole: this.mapCoinIdToSymbol(coinId),
          nom: coinId,
          prix: priceData[devise.toLowerCase()] || 0,
          devise: devise.toUpperCase(),
          variation24h: priceData[`${devise.toLowerCase()}_24h_change`] || 0,
          variation7j: 0, // CoinGecko gratuit ne fournit pas 7j dans simple/price
          volumeMarche: priceData[`${devise.toLowerCase()}_24h_vol`] || 0,
          capitalisationMarche: priceData[`${devise.toLowerCase()}_market_cap`] || 0,
          dernierMAJ: new Date().toISOString(),
        });
      }

      return results;
    } catch (error) {
      journal.error('crypto_get_multiple_prices_error', error as Error, { correlationId, symboles });
      throw error;
    }
  }

  /**
   * Calculer la valeur d'un portfolio crypto
   */
  async calculerPortfolio(
    actifs: Array<{
      symbole: string;
      quantite: number;
      prixAchatMoyen: number;
    }>,
    devise: string = 'eur',
    correlationId?: string
  ): Promise<PortfolioCrypto> {
    try {
      const symboles = actifs.map(a => a.symbole);
      const prixActuels = await this.obtenirPrixMultiples(symboles, devise, correlationId);

      let totalValeur = 0;
      let totalGainsPertesAbsolus = 0;

      const actifsAvecValeurs: ActifCrypto[] = actifs.map((actif) => {
        const prixActuel = prixActuels.find(p => p.symbole.toUpperCase() === actif.symbole.toUpperCase());

        if (!prixActuel) {
          journal.warn('Prix crypto introuvable', {
            symbole: actif.symbole,
            correlationId,
          });
          return {
            symbole: actif.symbole,
            nom: actif.symbole,
            quantite: actif.quantite,
            prixAchatMoyen: actif.prixAchatMoyen,
            prixActuel: 0,
            valeurActuelle: 0,
            gainsPerte: 0,
            pourcentageGainsPerte: 0,
          };
        }

        const valeurActuelle = actif.quantite * prixActuel.prix;
        const coutTotal = actif.quantite * actif.prixAchatMoyen;
        const gainsPerte = valeurActuelle - coutTotal;
        const pourcentageGainsPerte = coutTotal > 0 ? (gainsPerte / coutTotal) * 100 : 0;

        totalValeur += valeurActuelle;
        totalGainsPertesAbsolus += gainsPerte;

        return {
          symbole: actif.symbole,
          nom: prixActuel.nom,
          quantite: actif.quantite,
          prixAchatMoyen: actif.prixAchatMoyen,
          prixActuel: prixActuel.prix,
          valeurActuelle,
          gainsPerte,
          pourcentageGainsPerte,
        };
      });

      const totalCout = actifsAvecValeurs.reduce((sum, a) => sum + (a.quantite * a.prixAchatMoyen), 0);
      const pourcentageGainsPertesTotal = totalCout > 0 ? (totalGainsPertesAbsolus / totalCout) * 100 : 0;

      const portfolio: PortfolioCrypto = {
        totalValeur,
        devise: devise.toUpperCase(),
        derniereMAJ: new Date().toISOString(),
        actifs: actifsAvecValeurs,
        gainsPertesTotal: totalGainsPertesAbsolus,
        pourcentageGainsPertesTotal,
      };

      journal.logAction('portfolio_crypto_calcule', {
        totalValeur,
        gainsPertesTotal: totalGainsPertesAbsolus,
        nbActifs: actifs.length,
      }, correlationId);

      return portfolio;
    } catch (error) {
      journal.error('crypto_calculate_portfolio_error', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Mapper symbole vers CoinGecko ID
   */
  private mapSymboleToCoinId(symbole: string): string {
    const mapping: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'DOT': 'polkadot',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'LTC': 'litecoin',
    };

    return mapping[symbole.toUpperCase()] || symbole.toLowerCase();
  }

  /**
   * Mapper CoinGecko ID vers symbole
   */
  private mapCoinIdToSymbol(coinId: string): string {
    const mapping: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'tether': 'USDT',
      'binancecoin': 'BNB',
      'solana': 'SOL',
      'ripple': 'XRP',
      'cardano': 'ADA',
      'dogecoin': 'DOGE',
      'polkadot': 'DOT',
      'matic-network': 'MATIC',
      'avalanche-2': 'AVAX',
      'chainlink': 'LINK',
      'uniswap': 'UNI',
      'cosmos': 'ATOM',
      'litecoin': 'LTC',
    };

    return mapping[coinId] || coinId.toUpperCase();
  }
}

// Export singleton
export const cryptoClient = new CryptoClient();
