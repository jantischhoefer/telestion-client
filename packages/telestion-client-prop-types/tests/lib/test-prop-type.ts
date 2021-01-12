import { checkPropTypes, Requireable } from 'prop-types';

// nice spy to check if console.error has been called
const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

/**
 * tuple which stores the test case for a PropType
 *
 * - param 1 - the name of the case
 * - param 2 - the value to test with the PropType
 */
export type TestCase<T = unknown> = [string, T];

/**
 * Tests a PropType with different valid and invalid cases.
 * @param title - the title of the PropType
 * @param propType - the PropType to test
 * @param valid - valid cases to test
 * @param invalid - invalid cases to test
 *
 * @example
 * ```ts
 * // Jest context
 * import { MyPropType } from './my-prop-type';
 *
 * describe('Test my PropTypes', () => {
 * 	testPropType('MyPropType', MyPropType, [
 * 		['Valid example', { prop1: 'Hello' }]
 * 	], [
 * 		['Invalid example', { prop1: false }]
 * 	]);
 * });
 * ```
 */
export function testPropType(
	title: string,
	propType: Requireable<unknown>,
	valid: Array<TestCase>,
	invalid: Array<TestCase>
): void {
	beforeEach(() => {
		consoleSpy.mockClear();
	});

	if (valid.length > 0) {
		describe(`Test ${title} for valid cases`, () => {
			it.each(valid)('should pass on %s', (_, entry) => {
				console.log(`TypeSpec: { prop: ${JSON.stringify(propType)} }`);
				console.log(`Values: { prop: ${JSON.stringify(entry)} }`);

				checkPropTypes({ prop: propType }, { prop: entry }, 'prop', title);

				expect(consoleSpy).not.toHaveBeenCalled();
			});
		});
	}

	if (invalid.length > 0) {
		describe(`Test ${title} for invalid cases`, () => {
			it.each(invalid)('should fail on %s', (_, entry) => {
				console.log(`TypeSpec: { prop: ${JSON.stringify(propType)} }`);
				console.log(`Values: { prop: ${JSON.stringify(entry)} }`);

				checkPropTypes({ prop: propType }, { prop: entry }, 'prop', title);

				expect(consoleSpy).toHaveBeenCalled();
			});
		});
	}
}
