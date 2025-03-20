import { NetworkService } from "./NetwrokService";

 
const networkService = new NetworkService();
export async function getDifficulty() {
    try {
        return await networkService.getNetworkDifficulty();
    } catch (error) {
        console.error("Failed to fetch difficulty:", error);
        throw error;
    }
}

export async function getBitcoinRewardPerDay(minerHashrateTHs?: number) {
    try {
        return await networkService.getEstimatedEarningsPerDay(minerHashrateTHs, )
    } catch (error) {
        console.error("Failed to fetch bitcoin per day:", error);
        throw error;
    }
}
