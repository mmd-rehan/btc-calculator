# btc-reward-calculator

`btc-reward-calculator` is a TypeScript-based utility that fetches Bitcoin network difficulty, estimates miner earnings based on hashrate, and fetches Bitcoin prices in various currencies. It utilizes `@mempool/mempool.js` to retrieve blockchain data and calculate potential mining rewards.

## Features
- Fetches Bitcoin network difficulty from the latest block.
- Estimates daily mining rewards based on given hashrate.
- Uses the last eight blocks to calculate an average reward estimate.
- Fetches real-time Bitcoin prices in various currencies.

## Installation

Ensure you have `Node.js` installed, then install dependencies:

```sh
npm install @mempool/mempool.js
```

## Usage

### Importing the Service

```typescript
import { getDifficulty, getBitcoinRewardPerDay, getBitcoinPrice } from "./btc-reward-calculator";
```

### Fetching Bitcoin Network Difficulty

```typescript
(async () => {
    try {
        const difficulty = await getDifficulty();
        console.log(`Current Bitcoin Network Difficulty: ${difficulty}`);
    } catch (error) {
        console.error("Error fetching difficulty:", error);
    }
})();
```

### Estimating Mining Rewards

```typescript
(async () => {
    try {
        const minerHashrateTHs = 100; // Hashrate in TH/s
        const rewardPerDay = await getBitcoinRewardPerDay(minerHashrateTHs);
        console.log(`Estimated Bitcoin earnings per day: ${rewardPerDay.toFixed(8)} BTC`);
    } catch (error) {
        console.error("Error fetching estimated earnings:", error);
    }
})();
```

### Fetching Bitcoin Price

```typescript
(async () => {
    try {
        const prices = await getBitcoinPrice();
        console.log("Bitcoin Prices:", prices);
    } catch (error) {
        console.error("Error fetching Bitcoin prices:", error);
    }
})();
```

## API Reference

### `getDifficulty(): Promise<number>`
Fetches the latest Bitcoin network difficulty.

#### Example
```typescript
const difficulty = await getDifficulty();
console.log(difficulty);
```

### `getBitcoinRewardPerDay(minerHashrateTHs?: number): Promise<number>`
Estimates daily BTC earnings for a given miner hashrate (default: 100 TH/s).

#### Parameters
- `minerHashrateTHs` (optional, `number`): Miner hashrate in terahashes per second.

#### Example
```typescript
const earnings = await getBitcoinRewardPerDay(120);
console.log(`Estimated earnings: ${earnings} BTC`);
```

### `getBitcoinPrice(): Promise<CurrencyRates>`
Fetches the current Bitcoin price in various currencies.

#### Example
```typescript
const prices = await getBitcoinPrice();
console.log(prices);
```

## Implementation Details
- Uses `@mempool/mempool.js` to fetch blockchain data.
- Retrieves the last eight blocks to calculate an average block reward.
- Computes miner earnings using difficulty, hashrate, and block rewards.
- Fetches real-time Bitcoin prices from Mempool.space API.

## Error Handling
- Logs errors to console and throws exceptions when network issues occur.

## License
This project is licensed under the ISC License.
