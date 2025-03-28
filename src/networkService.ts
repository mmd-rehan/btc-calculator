import mempool from '@mempool/mempool.js';
import { Block } from '@mempool/mempool.js/lib/interfaces/bitcoin/blocks';

// Constants for clarity and maintainability
const SECONDS_PER_DAY = 86_400;
const SATOSHIS_PER_BTC = 1e8;
const TERAHASHES_TO_HASHES = 1e12;
const DIFFICULTY_FACTOR = 2 ** 32;

export class NetworkService {
    private readonly mempoolInstance = mempool();
    private readonly BLOCKS;
    private currentDifficulty: number | undefined;
    private initPromise: Promise<void>;

    constructor() {
        // Validate and initialize the mempool client
        if (!this.mempoolInstance?.bitcoin?.blocks) {
            throw new Error('Failed to initialize mempool client');
        }
        this.BLOCKS = this.mempoolInstance.bitcoin.blocks;
        this.initPromise = this.initializeDifficulty();
    }

    /**
     * Initializes the network difficulty by fetching the latest block's difficulty.
     * Sets this.currentDifficulty or undefined on failure.
     */
    private async initializeDifficulty(): Promise<void> {
        try {
            const blockHash = await this.BLOCKS.getBlocksTipHash();
            const block = await this.BLOCKS.getBlock({ hash: blockHash });
            this.currentDifficulty = block.difficulty;
        } catch (error) {
            console.error('Failed to initialize network difficulty:', error);
            this.currentDifficulty = undefined; // Avoid using 0 to prevent invalid calculations
        }
    }

    /**
     * Retrieves the current network difficulty.
     * @returns {Promise<number>} The network difficulty.
     * @throws {Error} If difficulty is not available.
     */
    public async getNetworkDifficulty(): Promise<number> {
        await this.initPromise;
        if (this.currentDifficulty === undefined) {
            throw new Error('Network difficulty initialization failed');
        }
        return this.currentDifficulty;
    }

    /**
     * Estimates daily Bitcoin earnings for a miner based on hashrate.
     * @param {number} minerHashrateTHs - Miner hashrate in TH/s (default: 100).
     * @returns {Promise<number>} Estimated earnings in BTC per day.
     * @throws {Error} If calculation dependencies fail.
     */
    public async getEstimatedEarningsPerDay(minerHashrateTHs: number = 100, networkDifficulty?: number): Promise<number> {
        if (networkDifficulty) {
            this.currentDifficulty = networkDifficulty;
        } else {
            await this.initPromise;
            if (this.currentDifficulty === undefined) {
                throw new Error('Network difficulty is not available');
            }
        }
        
        const lastEightBlocks = await this.getLastEightBlocks();
        const avgTotalRewardBTC = this.getAvgTotalRewardBTC(lastEightBlocks);
        const minerHashrateHs = minerHashrateTHs * TERAHASHES_TO_HASHES;
        const bitcoinPerDay =
            (minerHashrateHs * avgTotalRewardBTC * SECONDS_PER_DAY) /
            (this.currentDifficulty * DIFFICULTY_FACTOR);

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
            const block = await this.BLOCKS.getBlock({ hash: currentHash });
            lastEightBlocks.push(block);
            currentHash = block.previousblockhash;
        }

        return lastEightBlocks;
    }
}