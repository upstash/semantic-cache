import { SemanticCache } from './SemanticCache.js';
import dotenv from 'dotenv';

dotenv.config();

const cache = new SemanticCache(process.env.VECTOR_URL as string, process.env.VECTOR_TOKEN as string, 0.9);

const delayMs = 1000;

await cache.set("capital of france", "paris");
await delay(delayMs);
console.log("france's capital -> ", await cache.get("france's capital"));  // will print paris

await cache.set("capital of France", "Paris");
await delay(delayMs);
console.log("france's capital -> ", await cache.get("france's capital"));  // will print Paris

await cache.set("biggest city in USA", "New York");
await delay(delayMs);
console.log("largest city in USA ->", await cache.get("largest city in USA"));  // Outputs: "New York"

await cache.set("year when Berlin wall fell", "1989");
await delay(delayMs);
console.log("what year did the Berlin wall collapse ->", await cache.get("what year did the Berlin wall collapse"));  // Outputs: "1989"

await cache.set("chemical formula for water", "H2O");
await cache.set("best drink on a hot day", "water");
await delay(delayMs);

console.log("what to drink when it's hot -> ", await cache.get("what to drink when it's hot"));  // Outputs: "water"
console.log("what is water's chemical formula ->", await cache.get("what is water's chemical formula"));  // Outputs: "H2O"

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}