# Logger Utility Documentation

## Overview

The Logger utility provides a comprehensive, production-ready logging system for React applications. It includes features like batch logging, external service integration, performance monitoring, and configurable log levels.

## Features

- 🎯 **Multiple Log Levels**: debug, info, warn, error
- 📦 **Batch Processing**: Efficient log batching for performance
- 🌐 **External Services**: Integration with Sentry, LogRocket, DataDog, and custom endpoints
- ⚡ **Performance Monitoring**: Built-in timing utilities
- 🔒 **Rate Limiting**: Prevent log flooding
- 🎛️ **Configurable**: Environment-based configuration
- 📱 **Component Lifecycle**: Track React component events
- 👤 **User Actions**: Track user interactions
- 🌍 **API Monitoring**: Log API requests and responses

## Quick Start

### Basic Usage

```javascript
import { logger } from './utils/logger';

// Basic logging
logger.info('User logged in', { userId: 123 });
logger.warn('Rate limit approaching', { remaining: 5 });
logger.error('Failed to save data', { error: 'Network timeout' });

// Debug logging (only in development)
logger.debug('Debugging info', { state: currentState });
```

### Performance Monitoring

```javascript
// Start timing
logger.startTimer('data-processing');

// Your code here
await processData();

// End timing and get duration
const duration = logger.endTimer('data-processing');
```

### Component Lifecycle

```javascript
// In React components
useEffect(() => {
  logger.componentLifecycle('UserProfile', 'mount', { userId });
  
  return () => {
    logger.componentLifecycle('UserProfile', 'unmount', { userId });
  };
}, []);
```

### API Monitoring

```javascript
// Log API requests
const requestId = logger.apiRequest('GET', '/api/users');

try {
  const response = await fetch('/api/users');
  const data = await response.json();
  
  logger.apiResponse('GET', '/api/users', response.status, data, requestId);
} catch (error) {
  logger.apiError('GET', '/api/users', error.message, requestId);
}
```

### User Action Tracking

```javascript
// Track user interactions
logger.userAction('button_click', {
  buttonId: 'submit-form',
  location: 'checkout'
});

// Track page views
logger.pageView('/dashboard', 'Dashboard');

// Track feature usage
logger.featureUsed('advanced_search', {
  filters: ['date', 'category']
});
```

## Configuration

### Environment Variables

Create a `.env` file with your logging service credentials:

```bash
# Sentry
REACT_APP_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# LogRocket
REACT_APP_LOGROCKET_APP_ID=your-app-id

# DataDog
REACT_APP_DATADOG_CLIENT_TOKEN=your-client-token
REACT_APP_DATADOG_APPLICATION_ID=your-app-id

# Custom endpoints
REACT_APP_LOGGING_WEBHOOK_URL=https://your-api.com/logs
REACT_APP_LOGGING_API_KEY=your-api-key

# App version
REACT_APP_VERSION=1.0.0
```

### Runtime Configuration

```javascript
import { logger } from './utils/logger';

// Get current configuration
const config = logger.getConfig();

// Update configuration
logger.updateConfig({
  rateLimit: {
    enabled: true,
    maxLogsPerSecond: 5
  },
  batch: {
    maxSize: 20,
    flushInterval: 10000
  }
});
```

## Files Structure

```
src/utils/
├── logger.js              # Main logger class
├── loggerConfig.js         # Configuration settings
├── loggerExamples.js       # Usage examples
├── loggerTest.js          # Test functions
└── README.md              # This documentation
```

## Available Methods

### Core Logging Methods

- `logger.debug(message, data)` - Debug level logging
- `logger.info(message, data)` - Information logging
- `logger.warn(message, data)` - Warning logging
- `logger.error(message, data)` - Error logging

### Performance Methods

- `logger.startTimer(name)` - Start a performance timer
- `logger.endTimer(name, context)` - End timer and return duration

### Component Methods

- `logger.componentLifecycle(name, event, data)` - Log component events

### API Methods

- `logger.apiRequest(method, url, config)` - Log API requests
- `logger.apiResponse(method, url, status, data, requestId)` - Log API responses
- `logger.apiError(method, url, error, requestId)` - Log API errors

### User Tracking Methods

- `logger.userAction(action, details)` - Log user interactions
- `logger.pageView(path, title)` - Log page navigation
- `logger.featureUsed(featureName, details)` - Log feature usage

### Error Handling Methods

- `logger.errorBoundary(error, errorInfo, componentStack)` - Log React error boundary catches

### Utility Methods

- `logger.getConfig()` - Get current configuration
- `logger.updateConfig(newConfig)` - Update configuration
- `logger.flushLogs()` - Manually flush queued logs
- `logger.cleanup()` - Clean up resources

## External Service Integration

### Sentry Integration

The logger automatically integrates with Sentry when configured:

```javascript
// Errors are automatically sent to Sentry
logger.error('Database connection failed', {
  database: 'user_db',
  error: error.message
});
```

### Custom Webhook

Send logs to your custom endpoint:

```javascript
// Configure in loggerConfig.js or environment variables
services: {
  webhook: {
    enabled: true,
    url: 'https://your-api.com/logs',
    apiKey: 'your-api-key'
  }
}
```

## Testing

### Run Tests

```javascript
import { runAllTests, quickTest } from './utils/loggerTest';

// Quick test
quickTest();

// Comprehensive tests
runAllTests();
```

### Browser Console Testing

Open browser console and run:

```javascript
// Quick test
window.loggerTest.quickTest();

// All tests
window.loggerTest.runAllTests();
```

## Best Practices

### 1. Use Appropriate Log Levels

```javascript
// Good
logger.debug('Variable state', { variable: value }); // Development only
logger.info('User action completed', { action: 'login' }); // General info
logger.warn('Rate limit approaching', { remaining: 5 }); // Potential issues
logger.error('Operation failed', { error: error.message }); // Critical issues

// Avoid
logger.error('User clicked button'); // Not an error
logger.debug('Server error occurred'); // Wrong level
```

### 2. Include Relevant Context

```javascript
// Good
logger.info('Order processed', {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  timestamp: Date.now()
});

// Less useful
logger.info('Order processed');
```

### 3. Use Performance Monitoring

```javascript
// Monitor slow operations
logger.startTimer('database-query');
const results = await db.query(sql);
const duration = logger.endTimer('database-query');

if (duration > 1000) {
  logger.warn('Slow database query detected', { 
    sql: sql.substring(0, 100),
    duration 
  });
}
```

### 4. Track User Journey

```javascript
// Track user flow
logger.pageView('/checkout/shipping');
logger.userAction('form_field_focus', { field: 'address' });
logger.userAction('form_validation', { errors: ['zipcode'] });
logger.userAction('form_submit', { success: true });
```

## Production Deployment

### 1. Environment Configuration

Ensure production environment variables are set:

```bash
NODE_ENV=production
REACT_APP_SENTRY_DSN=your-production-dsn
REACT_APP_LOGGING_WEBHOOK_URL=your-production-endpoint
```

### 2. Performance Considerations

- Logs are batched and sent asynchronously
- Rate limiting prevents log flooding
- Debug logs are automatically disabled in production
- Failed log attempts include retry logic

### 3. Monitoring

Monitor your logging service dashboards for:
- Error rates and patterns
- Performance bottlenecks
- User behavior insights
- System health metrics

## Troubleshooting

### Common Issues

#### 1. Logs Not Appearing

```javascript
// Check configuration
console.log(logger.getConfig());

// Verify log level is enabled
logger.updateConfig({
  levels: {
    info: { enabled: true }
  }
});
```

#### 2. Rate Limiting Issues

```javascript
// Adjust rate limit
logger.updateConfig({
  rateLimit: {
    enabled: false // or increase maxLogsPerSecond
  }
});
```

#### 3. External Service Not Receiving Logs

```javascript
// Check service configuration
const config = logger.getConfig();
console.log('Service config:', config.services);

// Manually flush logs
logger.flushLogs();
```

### Debug Mode

Enable verbose debugging:

```javascript
// Enable all debug logging
logger.updateConfig({
  environment: {
    enableConsoleLogging: true
  },
  levels: {
    debug: { enabled: true }
  }
});
```

## Migration Guide

### From Console.log

```javascript
// Old
console.log('User action:', action);
console.error('API Error:', error);

// New
logger.userAction(action.type, action.data);
logger.apiError('POST', '/api/endpoint', error.message);
```

### From Basic Logging

```javascript
// Old
const log = (level, message) => {
  console.log(`[${level}] ${message}`);
};

// New
import { logger } from './utils/logger';
logger.info(message, additionalData);
```

## API Reference

See [loggerExamples.js](./loggerExamples.js) for comprehensive usage examples and [loggerTest.js](./loggerTest.js) for testing utilities.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the configuration
3. Run the test suite
4. Check browser console for errors
5. Verify external service credentials
