# AlgoLens Debug Logging System

A comprehensive logging system for the AlgoLens algorithm visualization platform that provides detailed insights into application behavior, performance metrics, and user interactions.

## Features

- 🔍 **Multi-level logging** (ERROR, WARN, INFO, DEBUG, TRACE)
- 🏷️ **Categorized logging** by component/feature
- 📊 **Performance monitoring** with timing and memory usage
- 🎯 **Real-time debug panel** with filtering and export
- ⚡ **Minimal production overhead** with environment-based configuration
- 🔧 **Easy setup presets** for different development scenarios

## Quick Start

### 1. Setup Logging Configuration

Use the setup script to configure logging for your development scenario:

```bash
# Standard development logging
npm run logging:setup development

# Verbose debugging with all categories
npm run logging:debug

# Performance-focused logging
npm run logging:performance

# Production-safe minimal logging
npm run logging:production
```

### 2. View Debug Logs

- **Browser Console**: All logs appear in the browser console with structured formatting
- **Debug Panel**: Press `Ctrl+Shift+D` to open the interactive debug panel
- **Export Logs**: Use the debug panel to export logs as JSON for analysis

## Logging Categories

| Category      | Description                       | When to Use              |
| ------------- | --------------------------------- | ------------------------ |
| `general`     | General application events        | Always enabled           |
| `algorithm`   | Algorithm execution and steps     | Algorithm development    |
| `runner`      | Animation runner state changes    | Animation debugging      |
| `canvas`      | Canvas rendering and interactions | UI/rendering issues      |
| `animation`   | Frame-by-frame animation details  | Animation performance    |
| `performance` | Timing, memory, and FPS metrics   | Performance optimization |
| `user`        | User interactions and input       | UX analysis              |
| `router`      | Navigation and routing events     | Routing issues           |
| `api`         | API calls and responses           | Backend integration      |
| `worker`      | Web worker communication          | Worker debugging         |
| `state`       | Application state changes         | State management         |

## Logging Levels

```typescript
ERROR; // Critical errors that break functionality
WARN; // Important issues that don't break the app
INFO; // General information about app flow
DEBUG; // Detailed debugging information
TRACE; // Very detailed execution traces
```

## Usage Examples

### Basic Logging

```typescript
import { log } from "@/lib/logger";

// Simple logging
log.info("User clicked start button");
log.error("Failed to load algorithm", error);
log.debug("Canvas resized", { width: 800, height: 600 });

// Category-specific logging
log.algorithm.start("bubble-sort", inputArray);
log.performance.metric("render-time", 16.7, "ms");
log.user.click("start-button", { algorithm: "merge-sort" });
```

### Component Logging

```typescript
import { useComponentLogger } from '@/lib/logger';

function MyComponent() {
  const componentLogger = useComponentLogger("MyComponent");

  useEffect(() => {
    componentLogger.mount();
    return () => componentLogger.unmount();
  }, []);

  const handleClick = () => {
    componentLogger.debug("Button clicked");
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Performance Monitoring

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

function ExpensiveComponent() {
  const { getCurrentMetrics, resetMetrics } = usePerformanceMonitor("ExpensiveComponent");

  // Component automatically logs render performance
  return <div>Heavy computation here</div>;
}
```

### Async Operation Logging

```typescript
import { useAsyncOperationMonitor } from "@/hooks/usePerformanceMonitor";

function DataLoader() {
  const { measure } = useAsyncOperationMonitor();

  const loadData = async () => {
    const data = await measure(
      () => fetch("/api/data").then((r) => r.json()),
      "data-loading",
      LogCategory.API
    );
    return data;
  };
}
```

## Environment Configuration

Configure logging through environment variables:

```bash
# Logging level: ERROR, WARN, INFO, DEBUG, TRACE
VITE_LOG_LEVEL=DEBUG

# Categories (comma-separated)
VITE_LOG_CATEGORIES=general,algorithm,performance

# Performance monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_FPS_MONITORING=true
VITE_ENABLE_MEMORY_MONITORING=true
```

## Configuration Presets

### Development

- **Level**: DEBUG
- **Categories**: general, algorithm, runner, canvas, animation, performance, user, router
- **Performance monitoring**: Enabled
- **Best for**: Day-to-day development

### Debugging

- **Level**: TRACE
- **Categories**: All categories
- **Performance monitoring**: Enabled
- **Best for**: Investigating complex bugs

### Performance

- **Level**: INFO
- **Categories**: performance, animation, runner
- **Performance monitoring**: Enabled
- **Best for**: Performance optimization

### Production

- **Level**: WARN
- **Categories**: general, performance
- **Performance monitoring**: Disabled
- **Best for**: Production builds

## Debug Panel Features

The interactive debug panel (`Ctrl+Shift+D`) provides:

- **Real-time log streaming** with auto-scroll
- **Multi-level filtering** by level and category
- **Search and filtering** capabilities
- **Log export** as JSON for external analysis
- **Performance statistics** and summaries
- **Memory usage monitoring** (in supported browsers)

## Performance Impact

The logging system is designed for minimal performance impact:

- **Production**: Logs are filtered at the source, minimal overhead
- **Development**: Structured logging with reasonable performance
- **Debugging**: Full logging may impact performance but provides maximum insight

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ❌ Don't log everything as INFO
log.info("Button color changed to blue");

// ✅ Use appropriate levels
log.debug("Button color changed to blue");
log.info("User started algorithm visualization");
log.error("Failed to load algorithm", error);
```

### 2. Include Relevant Context

```typescript
// ❌ Vague logging
log.debug("Animation step");

// ✅ Detailed context
log.animation.step(frameNumber, "swap", {
  indices: [3, 7],
  array: currentArray,
});
```

### 3. Use Categories Appropriately

```typescript
// ❌ Everything as general
log.debug("User clicked sort button");

// ✅ Use specific categories
log.user.click("sort-button", { algorithm: "quicksort" });
```

### 4. Avoid Logging Sensitive Data

```typescript
// ❌ Don't log sensitive information
log.debug("User credentials", { username, password });

// ✅ Log safely
log.debug("User authentication", { username, success: true });
```

## Troubleshooting

### No Logs Appearing

1. Check environment variables are set correctly
2. Ensure log level is appropriate for your messages
3. Verify categories include the ones you're using
4. Check browser console for any logger initialization errors

### Performance Issues

1. Reduce log level (INFO instead of DEBUG)
2. Limit categories to essential ones
3. Disable performance monitoring in production
4. Check for excessive trace-level logging

### Debug Panel Not Opening

1. Ensure you're in development mode
2. Check for JavaScript errors in console
3. Verify the keyboard shortcut (Ctrl+Shift+D)
4. Try refreshing the page

## Contributing

When adding new logging:

1. Use existing categories when possible
2. Add new categories sparingly and document them
3. Include relevant context data
4. Test with different log levels
5. Ensure production performance isn't impacted

## API Reference

See the full TypeScript definitions in `src/lib/logger.ts` for complete API documentation.
