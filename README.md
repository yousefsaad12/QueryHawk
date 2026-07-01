# QueryHawk 🦅

A powerful PostgreSQL query instrumentation and monitoring library for Node.js applications. QueryHawk provides deep insights into your database queries with minimal code changes, helping you identify performance bottlenecks, track query patterns, and debug database issues efficiently.

## 🌟 Features

- **Zero-Configuration Setup**: Instrument your PostgreSQL client with a single function call
- **Query Timing**: Automatic duration tracking for all executed queries
- **Stack Trace Analysis**: Pinpoints the exact location in your code where queries originate
- **Query Fingerprinting**: Identifies similar query patterns for optimization opportunities
- **Comprehensive Error Handling**: Custom error classes with detailed context
- **Interceptor Pattern**: Modular architecture for easy extensibility
- **TypeScript Support**: Full type safety and IntelliSense support
- **Cross-Platform**: Works on Windows, Linux, and macOS

## 🏗️ Architecture

QueryHawk uses a modular interceptor-based architecture that allows you to compose different monitoring capabilities:

```
QueryHawk
├── Core
│   ├── BaseDriver: Abstract base class for database drivers
│   └── Interceptor Interface: Defines the interceptor contract
├── Drivers
│   └── PgDriver: PostgreSQL-specific implementation
├── Interceptors
│   ├── TimingInterceptor: Measures query execution time
│   ├── StackTraceInterceptor: Captures query origin location
│   └── FingerprintInterceptor: Normalizes queries for pattern matching
├── Context
│   └── QueryContext: Shared context object passed through interceptors
└── Errors
    └── Custom error classes with PostgreSQL error classification
```

## 📦 Installation

```bash
npm install queryhawk
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { Client } from "pg";
import { instrumentPg } from "queryhawk";

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Instrument the client
instrumentPg(client);

await client.connect();

// Use normally - QueryHawk automatically monitors all queries
const result = await client.query("SELECT * FROM users WHERE id = $1", [1]);

await client.end();
```

### Environment Variables

Create a `.env` file in your project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password
```

## 🔧 Advanced Usage

### Custom Interceptor Chain

```typescript
import { PgDriver } from "queryhawk/drivers/pg.driver";
import { TimingInterceptor } from "queryhawk/interceptors/timing.interceptor";
import { StackTraceInterceptor } from "queryhawk/interceptors/stackTrace.interceptor";
import { FingerprintInterceptor } from "queryhawk/interceptors/fingerprint.interceptor";

const driver = new PgDriver(client);

driver
  .use(new TimingInterceptor())
  .use(new StackTraceInterceptor())
  .use(new FingerprintInterceptor());

const result = await driver.query("SELECT * FROM users");
```

### Custom Interceptors

Create your own interceptors by implementing the `Interceptor` interface:

```typescript
import { Interceptor } from "queryhawk/core/interceptor.interface";
import { QueryContext } from "queryhawk/context/query.context";

class CustomInterceptor implements Interceptor<QueryContext, any[]> {
  beforeQuery(query: QueryContext) {
    console.log(`About to execute: ${query.sql}`);
    return query;
  }

  afterQuery(result: any[], query: QueryContext) {
    console.log(`Query completed in ${query.duration}ms`);
    return result;
  }

  onError(error: unknown, query: QueryContext) {
    console.error(`Query failed: ${error}`);
  }
}
```

### Error Handling

QueryHawk provides comprehensive error handling with custom error classes:

```typescript
import {
  ConfigurationError,
  ConnectionError,
  QueryExecutionError,
  ValidationError,
  classifyPostgresError
} from "queryhawk/errors/query.errors";

try {
  await driver.query("SELECT * FROM users");
} catch (error) {
  if (error instanceof QueryExecutionError) {
    console.error(`Failed SQL: ${error.sql}`);
    console.error(`Parameters: ${error.params}`);
    console.error(`Original error: ${error.originalError}`);
  }
}
```

## 📊 Query Context

QueryHawk maintains a rich context object for each query:

```typescript
interface QueryContext {
  sql: string;                    // The SQL query
  params?: any[];                 // Query parameters
  queryType?: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "OTHER";
  duration?: number;              // Execution time in milliseconds
  startTime: number;              // Query start timestamp
  stackTrace?: string;             // Origin location in code
  isSlow?: boolean;               // Whether query exceeded threshold
  error?: Error;                  // Error if query failed
  success?: boolean;              // Query success status
  explainPlan?: any;              // Query execution plan
  suggestion?: any;              // Optimization suggestions
  callerStack?: string;           // Full stack trace
  normalizedSql?: string;         // Fingerprinted query
}
```

## 🎯 Use Cases

- **Performance Monitoring**: Identify slow queries in development and production
- **Debugging**: Quickly locate which code is executing problematic queries
- **Query Optimization**: Find similar query patterns that can be optimized
- **Development**: Understand your application's database interaction patterns
- **Testing**: Verify query behavior and performance in test suites
- **Auditing**: Track all database queries for compliance and security

## 🔍 Error Classification

QueryHawk automatically classifies PostgreSQL errors into categories:

- **Connection Errors** (08xxx): Network failures, authentication issues
- **Constraint Violations** (23505, 23503, 23502, 23514): Unique, foreign key, not null, check constraints
- **Syntax Errors** (42601): Invalid SQL syntax
- **Permission Errors** (42501): Insufficient privileges
- **Table/Column Not Found** (42P01, 42703): Missing schema elements

## 🛠️ Development

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
├── core/
│   ├── base.driver.ts          # Abstract driver base class
│   └── interceptor.interface.ts # Interceptor contract
├── drivers/
│   └── pg.driver.ts            # PostgreSQL driver implementation
├── interceptors/
│   ├── timing.interceptor.ts   # Query timing interceptor
│   ├── stackTrace.interceptor.ts # Stack trace interceptor
│   └── fingerprint.interceptor.ts # Query fingerprinting
├── context/
│   └── query.context.ts        # Query context interface
├── errors/
│   └── query.errors.ts         # Custom error classes
├── instrument.ts               # Main instrumentation function
└── test.ts                     # Example usage
```

## 📝 API Reference

### `instrumentPg(client: Client)`

Instruments a PostgreSQL client with QueryHawk monitoring.

**Parameters:**
- `client`: The PostgreSQL `Client` instance to instrument

**Throws:**
- `ConfigurationError`: If client is invalid or query method is not a function

### `PgDriver`

PostgreSQL driver implementation with interceptor support.

**Methods:**
- `query(sql: string, params?: any[], callerStack?: string)`: Execute a query with monitoring
- `use(interceptor: Interceptor)`: Add an interceptor to the chain

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 🎓 Project Rating

### Innovation: 8/10
QueryHawk combines several monitoring techniques (timing, stack traces, fingerprinting) into a cohesive, easy-to-use package. The interceptor pattern provides excellent extensibility while maintaining simplicity.

### Practicality: 9/10
Solves a real problem that every Node.js + PostgreSQL application faces. Zero-configuration setup makes it immediately useful for developers of all skill levels.

### Market Potential: 7/10
Database monitoring tools exist (pgHero, DataDog, etc.), but QueryHawk fills a unique niche as a lightweight, code-level monitoring solution. Good for development teams and smaller applications.

### Technical Quality: 8/10
- Clean architecture with separation of concerns
- Comprehensive error handling
- TypeScript support with proper typing
- Cross-platform compatibility
- Good use of design patterns (interceptor, strategy)

### Completeness: 6/10
Core features are well-implemented, but could benefit from:
- Slow query threshold configuration
- Query result caching interceptor
- Metrics export (Prometheus, etc.)
- Web dashboard for visualization
- Support for other databases (MySQL, SQLite)

### Overall Rating: 7.6/10

**Verdict:** QueryHawk is a solid, practical tool that addresses a genuine need in the Node.js ecosystem. With additional features like metrics export and visualization, it could become a go-to solution for database monitoring in TypeScript applications.

## 🔮 Future Roadmap

- [ ] Support for MySQL and SQLite drivers
- [ ] Query result caching interceptor
- [ ] Slow query threshold configuration
- [ ] Metrics export (Prometheus, StatsD)
- [ ] Web dashboard for query visualization
- [ ] Query optimization suggestions
- [ ] Integration with popular ORMs (Prisma, TypeORM)
- [ ] Production-ready logging integrations (Winston, Pino)
