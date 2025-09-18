# Time Selection Testing Guide

This guide covers the comprehensive testing suite for the time selection functionality in the Maraxo appointment booking system.

## Overview

The time selection functionality is critical for the appointment booking system. It must ensure that:
- Time slots are properly synchronized with date selection
- Available times are correctly generated and displayed
- Form state is properly managed across date changes
- Performance is maintained with large datasets

## Test Structure

### 1. Test Files Organization

```
tests/
├── time-selection-comprehensive.test.ts    # Main component tests
├── api-available-times-comprehensive.test.ts  # API endpoint tests
├── time-generation-logic.test.ts          # Time generation algorithm tests
├── time-synchronization.test.ts           # Date-time synchronization tests
├── time-selection-stress-test.js          # Stress testing with 100+ dates
└── run-time-selection-tests.js            # Test runner script
```

### 2. Test Categories

#### Component Tests (`time-selection-comprehensive.test.ts`)
- Date and time synchronization
- Time generation logic
- Error handling
- Performance and caching
- UI state management
- Form integration

#### API Tests (`api-available-times-comprehensive.test.ts`)
- Default schedule tests
- Custom schedule tests
- Appointment integration tests
- Error handling tests
- Edge cases (leap years, timezones)
- Performance tests

#### Time Generation Logic Tests (`time-generation-logic.test.ts`)
- Basic time interval generation
- Appointment exclusion logic
- Edge cases
- Time format validation
- Performance with large datasets
- Real-world scenarios

#### Synchronization Tests (`time-synchronization.test.ts`)
- Date-time synchronization issues
- Form field synchronization
- Loading state synchronization
- Error state synchronization
- 100+ date synchronization test

#### Stress Tests (`time-selection-stress-test.js`)
- 100+ date testing
- Concurrent request handling
- Performance analysis
- Real-world scenario simulation

## Running Tests

### Individual Test Files

```bash
# Run specific test file
npm run test tests/time-selection-comprehensive.test.ts

# Run all time selection tests
npm run test:time-selection

# Run stress test only
npm run test:time-selection:stress
```

### Test Runner

The comprehensive test runner (`run-time-selection-tests.js`) executes all tests and generates detailed reports:

```bash
node tests/run-time-selection-tests.js
```

## Test Scenarios

### 1. Date-Time Synchronization

Tests ensure that when a user selects a date, the time selection component:
- Immediately clears previous times
- Fetches new available times
- Updates the UI accordingly
- Handles rapid date changes without race conditions

### 2. Time Generation Logic

Tests verify that time intervals are generated correctly:
- 20-minute intervals between start and end times
- Exclusion of booked appointment times
- Proper handling of edge cases (odd start/end times)
- Consistent formatting

### 3. Form State Management

Tests ensure form state is properly managed:
- Form fields are cleared when date changes
- Selected times are maintained during date changes
- Form validation works correctly

### 4. Error Handling

Tests verify graceful error handling:
- API errors don't crash the component
- Network errors are handled properly
- Invalid dates are rejected
- Loading states are shown appropriately

### 5. Performance Testing

Tests verify performance with large datasets:
- 100+ dates are handled efficiently
- Concurrent requests don't cause issues
- Memory usage remains reasonable
- Response times are acceptable

## Key Test Cases

### Critical Synchronization Issues

1. **Rapid Date Changes**: Ensures no stale data is displayed
2. **Form Field Clearing**: Verifies form state is reset on date change
3. **Loading States**: Confirms proper loading indicators
4. **Error Recovery**: Tests recovery from failed requests

### Time Generation Edge Cases

1. **Odd Time Windows**: Tests with non-standard start/end times
2. **Many Appointments**: Verifies performance with many booked slots
3. **Empty Time Windows**: Tests when no times are available
4. **Leap Year Dates**: Ensures proper handling of special dates

### API Endpoint Testing

1. **Default Schedules**: Tests standard day-of-week schedules
2. **Custom Schedules**: Tests special date configurations
3. **Appointment Integration**: Verifies existing appointments are excluded
4. **Error Responses**: Tests various error conditions

## Performance Benchmarks

### Response Time Targets
- API calls: < 500ms
- Time generation: < 100ms
- UI updates: < 200ms
- Total user interaction: < 1000ms

### Success Rate Targets
- API availability: > 99%
- Time generation accuracy: 100%
- Form synchronization: 100%
- Overall system reliability: > 95%

## Troubleshooting

### Common Issues

1. **Times Not Displaying**: Check API response and time generation logic
2. **Stale Data**: Verify date change handling and state clearing
3. **Performance Issues**: Check concurrent request handling
4. **Form State Issues**: Verify form field clearing on date changes

### Debug Mode

Enable debug logging by setting environment variables:

```bash
DEBUG_TIME_SELECTION=true npm run test:time-selection
```

### Test Data

The stress test uses 100+ dates covering:
- All days of the week
- Leap year dates
- Year boundaries
- Timezone edge cases
- Various appointment scenarios

## Continuous Integration

### Automated Testing

Tests are designed to run in CI/CD pipelines:
- Headless browser testing
- Database mocking
- Parallel test execution
- Detailed reporting

### Test Reports

Test results are saved to `test-results/` directory with:
- JSON format for programmatic analysis
- Timestamped files for historical tracking
- Detailed error information
- Performance metrics

## Maintenance

### Adding New Tests

1. Create test file in `tests/` directory
2. Follow naming convention: `*.test.ts` or `*.test.js`
3. Add to test runner configuration
4. Update documentation

### Updating Existing Tests

1. Maintain backward compatibility
2. Update test data as needed
3. Verify test coverage
4. Update documentation

## Best Practices

### Test Design
- Use descriptive test names
- Test one concept per test
- Use realistic test data
- Mock external dependencies
- Clean up after tests

### Performance Testing
- Test with realistic data volumes
- Monitor memory usage
- Test concurrent scenarios
- Measure response times
- Set performance benchmarks

### Error Testing
- Test all error conditions
- Verify error messages
- Test error recovery
- Ensure graceful degradation
- Test edge cases

## Conclusion

This comprehensive testing suite ensures the time selection functionality works reliably across all scenarios. The tests cover synchronization issues, performance requirements, and edge cases that could affect user experience.

Regular execution of these tests helps maintain system reliability and catch issues early in the development process.
