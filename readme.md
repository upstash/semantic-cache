
# Semantic Cache

Semantic Cache is a key value store that leverages similarity search capabilities provided by Upstash Vector to enable fuzzy data retrieval based on the meaning behind queries rather than exact word matches. This allows for flexible data access patterns which are particularly useful in applications involving natural language interactions.

## Features

- **Semantic Query Understanding**: Retrieves stored data by understanding the semantics of the query, not just the literal text.
- **Synonym Handling**: Recognizes and handles synonyms, allowing for diverse phrasing in queries.
- **Multilingual Support**: Capable of handling queries across different languages (if configured with multilingual vector models).
- **Complex Query Support**: Processes and understands complex queries to return relevant data.
- **Easy Integration**: Simple API for integrating with Node.js applications using the Upstash Vector service.
- **Customizable**: Allows for setting a minimum proximity threshold to filter out less accurate results.

## Getting Started

### Prerequisites

- npm or yarn
- Access to Upstash Vector API (URL and token required)

### Installation

Install the dependencies:

```bash
npm install @upstash/semantic-cache
```

### Setup

First create an Upstash Vector Index, and obtain the URL and token. Choosing an embedding model is required. You can sign up for a free account at [Upstash](https://console.upstash.com/).

> [!NOTE]  
> Choose an embedding model fits your use case. For example, if low latency is a priority, choose a model with a smaller size. If accuracy is important, choose a model with a larger size. 

Create a `.env` file in the root directory of the project and add your Upstash Vector URL and token:

```plaintext
VECTOR_URL=https://example.upstash.io
VECTOR_TOKEN=your_secret_token_here
```

### Using the SemanticCache

Here’s how you can use the SemanticCache in your Node.js application:

```typescript
import { SemanticCache } from '@upstash/SemanticCache';

const cache = new SemanticCache(process.env.VECTOR_URL, process.env.VECTOR_TOKEN, 0.9);

async function runDemo() {
await cache.set("capital of Turkey", "Ankara");
await delay(1000);
console.log(await cache.get("Turkey's capital"));  // Outputs: "Ankara"
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

runDemo();
```

### About MinProximity Parameter

The third parameter of the `SemanticCache` constructor is the `minProximity` parameter. This parameter is used to filter out results that are below a certain similarity threshold. A higher value will require more accuracy to hit for the cache. Lower value will increase the hit rate but may return less accurate results. The default value is 0.9. 

MinProximity is a value between 0 and 1. If you set is to 1.0 then it acts like a hash map which means only exact lexical matches will be returned. If you set it to 0.0 then it acts like a full text search query which means a value with the best proximity score (closest value) will be returned.

## Examples

The following examples demonstrate how `SemanticCache` can be utilized in various scenarios:

> [!NOTE]  
> Note that we add a 1-second delay after setting the data to allow time for the vector index to update. This is necessary to ensure that the data is available for retrieval.


### Basic Semantic Retrieval

```typescript
await cache.set("capital of France", "Paris");
await delay(1000);
console.log(await cache.get("france's capital"));  // Outputs: "Paris"
```

### Handling Synonyms

```typescript
await cache.set("biggest city in USA", "New York");
await delay(1000);
console.log(await cache.get("largest city in USA"));  // Outputs: "New York"
```

### Multilingual Queries

Note that your embedding model must support the languages you intend to use.         

```typescript
await cache.set("German Chancellor", "Olaf Scholz");
await delay(1000);
console.log(await cache.get("Bundeskanzler von Deutschland"));  // Outputs: "Olaf Scholz"
```

### Complex Queries

```typescript
await cache.set("year when Berlin wall fell", "1989");
await delay(1000);
console.log(await cache.get("what year did the Berlin wall collapse"));  // Outputs: "1989"
```

### Different Contexts

```typescript
await cache.set("chemical formula for water", "H2O");
await cache.set("best drink on a hot day", "water");
await delay(1000);
console.log(await cache.get("what to drink when it's hot"));  // Outputs: "water"
console.log(await cache.get("what is water's chemical formula"));  // Outputs: "H2O"
```

## Contributing

We welcome contributions from the community! If you'd like to contribute to the SemanticCache project, please fork the repository, make your changes, and submit a pull request.

## License

Distributed under the MIT License. See `LICENSE` for more information.

