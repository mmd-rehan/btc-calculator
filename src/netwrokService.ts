import mempool from '@mempool/mempool.js';
import { Block } from '@mempool/mempool.js/lib/interfaces/bitcoin/blocks';

// Constants for clarity and maintainability
const SECONDS_PER_DAY = 86_400;
const SATOSHIS_PER_BTC = 1e8;
const TERAHASHES_TO_HASHES = 1e12;
const DIFFICULTY_FACTOR = 2 ** 32;

export class NetworkService {
    private readonly BLOCKS;

    constructor() {
        const mempoolInstance = mempool();
        if (!mempoolInstance?.bitcoin?.blocks) {
            throw new Error('Failed to initialize mempool client');
        }
        this.BLOCKS = mempoolInstance.bitcoin.blocks;
    }

    /**
     * Retrieves the current network difficulty from the latest block.
     * @returns {Promise<number>} The network difficulty.
     * @throws {Error} If the difficulty cannot be retrieved.
     */
    public async getNetworkDifficulty(): Promise<number> {
        try {
            const blockHash = await this.BLOCKS.getBlocksTipHash();
            const block = await this.BLOCKS.getBlock({ hash: blockHash });
            return block.difficulty;
        } catch (error) {
            console.error('Failed to retrieve network difficulty:', error);
            throw new Error('Unable to retrieve network difficulty');
        }
    }

    /**
     * Estimates daily Bitcoin earnings for a miner based on hashrate.
     * @param {number} minerHashrateTHs - Miner hashrate in TH/s (default: 100).
     * @param {number} numberOfSecondsPerDay - Seconds in a day (default: 86400).
     * @returns {Promise<number>} Estimated earnings in BTC per day.
     * @throws {Error} If calculation dependencies fail.
     */
    public async getEstimatedEarningsPerDay(minerHashrateTHs: number = 100): Promise<number> {
        const lastEightBlocks = await this.getLastEightBlocks();
        const avgTotalRewardBTC = this.getAvgTotalRewardBTC(lastEightBlocks);
        const difficulty = await this.getNetworkDifficulty(); 

        const minerHashrateHs = minerHashrateTHs * TERAHASHES_TO_HASHES;
        const bitcoinPerDay =
            (minerHashrateHs * avgTotalRewardBTC * SECONDS_PER_DAY) /
            (difficulty * DIFFICULTY_FACTOR);

        return bitcoinPerDay;
    }

    /**
     * Calculates the average total reward in BTC from an array of blocks.
     * @param {Block[]} blocks - Array of blockchain blocks.
     * @returns {number} Average reward in BTC.
     */
    private getAvgTotalRewardBTC(blocks: Block[]): number {
        const totalRewardsSatoshis = blocks.map((block) => block.extras.reward);
        const sumRewardsSatoshis = totalRewardsSatoshis.reduce((sum, reward) => sum + reward, 0);
        return sumRewardsSatoshis / blocks.length / SATOSHIS_PER_BTC;
    }

    /**
     * Fetches the last eight blocks from the blockchain, starting from the tip.
     * @returns {Promise<Block[]>} Array of the last eight blocks.
     * @throws {Error} If block retrieval fails.
     */
    private async getLastEightBlocks(): Promise<Block[]> {
        const lastEightBlocks: Block[] = [];
        let currentHash = await this.BLOCKS.getBlocksTipHash();

        for (let i = 0; i < 8; i++) {
            try {
                const block = await this.BLOCKS.getBlock({ hash: currentHash });
                lastEightBlocks.push(block);
            } catch (error) {
                console.error(`Failed to fetch block ${i + 1}:`, error);
                throw new Error(`Unable to fetch block at height ${i + 1}`);
            }
        }

        return lastEightBlocks;
    }
}