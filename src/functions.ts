import { MempoolService } from "./mempoolService";
import { NetworkService } from "./networkService";
import { CurrencyRates } from "./types";

const networkService = new NetworkService();
export async function getDifficulty() {
    try {
        return await networkService.getNetworkDifficulty();
    } catch (error) {
        console.error("Failed to fetch difficulty:", error);
        throw error;
    }
}

export async function getBitcoinRewardPerDay(minerHashrateTHs?: number, networkDifficulty?: number) {
    try {
        return await networkService.getEstimatedEarningsPerDay(minerHashrateTHs, networkDifficulty)
    } catch (error) {
        console.error("Failed to fetch bitcoin per day:", error);
        throw error;
    }
}


export async function getBitcoinPrices(): Promise<CurrencyRates> {
    try {
        const mempoolService = new MempoolService();
        return await mempoolService.getBitcoinPrice();
    } catch (error) {
        console.error("Failed to fetch bitcoin per day:", error);
        throw error;
    }
}

export async function getBitcoinUsdPrices(): Promise<number> {
    try {
        const mempoolService = new MempoolService();
        return (await mempoolService.getBitcoinPrice()).USD;
    } catch (error) {
        console.error("Failed to fetch bitcoin per day:", error);
        throw error;
    }
}