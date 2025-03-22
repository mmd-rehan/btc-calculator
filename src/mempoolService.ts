import { CurrencyRates } from "./types";

const mempoolSpaceUrl = "https://mempool.space/api/v1";

export class MempoolService {
    
    public async getBitcoinPrice(): Promise<CurrencyRates> {
        try {
            const response = await fetch(`${mempoolSpaceUrl}/prices`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return  await response.json();
        } catch (error) {
            console.error('Failed to fetch Bitcoin price:', error);
            throw error;
        }
    }

}