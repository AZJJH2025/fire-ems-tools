const { test, expect } = require('@playwright/test');

function transformFieldName(fieldName) {
  return fieldName.toLowerCase()
    .split(' ')
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
}

test.describe('Field Mapping Transformation', () => {
  test('should transform field names from space format to camelCase', async () => {
    const testCases = [
      { input: 'Incident ID', expected: 'incidentId' },
      { input: 'Incident Date', expected: 'incidentDate' },
      { input: 'Response Time', expected: 'responseTime' },
      { input: 'Unit Name', expected: 'unitName' },
      { input: 'Dispatch Time', expected: 'dispatchTime' },
      { input: 'Arrival Time', expected: 'arrivalTime' },
      { input: 'First Unit Arrival', expected: 'firstUnitArrival' },
      { input: 'Location', expected: 'location' }
    ];

    for (const { input, expected } of testCases) {
      const result = transformFieldName(input);
      expect(result).toBe(expected);
    }
  });

  test('should handle edge cases in field name transformation', async () => {
    // Edge cases
    expect(transformFieldName('')).toBe('');
    expect(transformFieldName('SingleWord')).toBe('singleword');
    expect(transformFieldName('UPPER CASE')).toBe('upperCase');
    expect(transformFieldName('  Extra  Spaces  ')).toBe('extraSpaces');
    expect(transformFieldName('Special@Characters!')).toBe('special@characters!');
    expect(transformFieldName('123 Numeric')).toBe('123Numeric');
  });
});