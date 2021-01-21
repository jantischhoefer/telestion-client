import create, { State, UseStore } from 'zustand';
import {
	PreferencesStore,
	GroupSelector,
	PrefSelector,
	PrefValue,
	PrefRenderer,
	Preference,
	PreferencesGroup
} from '@wuespace/telestion-client-types';
import { isEmpty } from '../../lib/core-utils';

/**
 * The preference state and actions of the Telestion Client Core.
 *
 * Defines the preferences store and functions to change the store.
 *
 * @see {@link PreferencesState.preferences}
 * @see {@link PreferencesState.setValue}
 */
export interface PreferencesState extends State {
	/**
	 * Stores the registered preferences as groups of selector-value pair.
	 *
	 * To add, update and remove the preference value use {@link setValue}.
	 *
	 * To add, update and remove the preference renderer
	 * use {@link setRenderer} instead.
	 *
	 * @see {@link PreferencesState.setValue}
	 * @see {@link PreferencesState.setRenderer}
	 *
	 * @example
	 * ```ts
	 * const preference = usePreferences(
	 * 	state => state.preferences['group']['preference'].value
	 * );
	 *
	 * return <div>{preferences}</div>;
	 * ```
	 */
	preferences: PreferencesStore;

	/**
	 * Adds, updates or removes a preference value from the preference store.
	 *
	 * To access the preference a group and a preference selector is needed.
	 *
	 * If the group selector is `null`
	 * the preference in the global scope will be used.
	 *
	 * @param group - the group of the preference
	 * @param preference - the preference name
	 * @param newValue - the new value of the preference
	 *
	 * @see {@link PreferencesState.preferences}
	 * @see {@link PrefValue}
	 * @see {@link PreferencesState.setRenderer}
	 * @see {@link PreferencesState.removePreference}
	 *
	 * @example
	 * ```ts
	 * const update = usePreferences(state => state.updateValue);
	 * const handleClick = () => update('group', 'preference', 'My new value!');
	 *
	 * return <button onClick={handleClick}>Set Preference</button>;
	 * ```
	 */
	setValue: (
		group: GroupSelector,
		preference: PrefSelector,
		newValue: PrefValue
	) => void;

	/**
	 * Adds, updates or removes a preference renderer from the preference store.
	 *
	 * To access the preference a group and a preference selector is needed.
	 *
	 * If the group selector is `null`
	 * the preference in the global scope will be used.
	 *
	 * @param group - the group of the preference
	 * @param preference - the preference name
	 * @param newRenderer - the new renderer for the preference
	 *
	 * @see {@link PreferencesState.preferences}
	 * @see {@link PrefRenderer}
	 * @see {@link PreferencesState.setValue}
	 *
	 * @example
	 * ```ts
	 * const update = usePreferences(state => state.updateValue);
	 * const renderer = (value, setValue) => (
	 * 	<TextInput initialValue={value} onSubmit={setValue} />
	 * );
	 *
	 * const handleClick = () => update('group', 'preference', renderer);
	 *
	 * return <button onClick={handleClick}>Set Renderer</button>;
	 * ```
	 */
	setRenderer: (
		group: GroupSelector,
		preference: PrefSelector,
		newRenderer: PrefRenderer
	) => void;

	/**
	 * Removes a preference from the store.
	 *
	 * To access the preference a group and a preference selector is needed.
	 *
	 * If the group selector is `null`
	 * the preference in the global scope will be used.
	 *
	 * @param group - the group of the preference
	 * @param preference - the name of the preference that will be removed
	 *
	 * @see {@link PreferencesState.setValue}
	 * @see {@link PreferencesState.removeGroup}
	 */
	removePreference: (group: GroupSelector, preference: PrefSelector) => void;

	/**
	 * Removes an entire group of preferences from the store.
	 *
	 * To access the group and a selector is needed.
	 *
	 * If the group selector is `null`
	 * the preference in the global scope will be used.
	 *
	 * @param group - the name of the group that will be removed
	 *
	 * @see {@link PreferencesState.removePreference}
	 * @see {@link PreferencesState.setValue}
	 */
	removeGroup: (group: GroupSelector) => void;

	/**
	 * Overwrites the current preferences store with the specified store.
	 * @param newStore - the new preferences store to use
	 *
	 * @see {@link PreferencesStore}
	 * @see {@link PreferencesState.preferences}
	 */
	setStore: (newStore: PreferencesStore) => void;
}

/**
 * Returns the preferences application state and actions to interact with.
 * A selector can be defined to pick out parts of the store.
 * If correctly set up, the function only triggers a rerender
 * if the selected values have changed.
 *
 * For more information about state management in Zustand,
 * take a look at their {@link https://github.com/pmndrs/zustand | GitHub page}.
 *
 * @param selector - optional selector function
 * which picks the specified elements out of the store
 * @param equalityFn - optional equality function
 * to check for state updates on the picked elements
 * @returns the picked elements in the selector function
 *
 * @see {@link PreferencesState}
 * @see {@link https://github.com/pmndrs/zustand}
 * @see {@link UseStore}
 * @see {@link zustand#shallow}
 *
 * @example
 * Fetch current preference from the store:
 * ```ts
 * // React component or hook context
 * const myGroupSelector = 'my-group';
 * const myVarSelector = 'my-var';
 * const myPreference = usePreferences(
 * 	state => state.preferences[myGroupSelector][myVarSelector]
 * );
 * ```
 *
 * Performance optimized and type-safe fetching from the store:
 * ```ts
 * import { useCallback, ReactNode } from 'react';
 * import { StateSelector } from 'zustand';
 * import shallow from 'zustand/shallow';
 * import {
 * 	usePreferences,
 * 	PreferencesState
 * } from '@wuespace/telestion-client-core';
 * import { someRenderer } from './some-renderer';
 *
 * // selector does not depend on scope, so it's better to define it outside
 * // to not re-declare it on every render
 * const selector: StateSelector<
 * 	PreferencesState,
 * 	{
 * 		setValue: PreferencesState['setValue'],
 * 		setRenderer: PreferencesState['setRenderer']
 * 	}
 * > = state => ({
 * 	setValue: state.setValue,
 * 	setRenderer: state.setRenderer
 * });
 *
 * export function MyComponent(): ReactNode {
 * 	const { setValue, setRenderer } = usePreferences(selector, shallow);
 *
 * 	const updateValue = useCallback(
 * 		() => setValue('null', 'title', 'New Application Title!'),
 * 		[]
 * 	);
 *
 * 	const updateRenderer = useCallback(
 * 		() => setRenderer('null', 'title', someRenderer),
 * 		[]
 * 	);
 *
 * 	return (
 * 		<div>
 * 			<button onClick={updateValue}>Update Value</button>
 * 			<button onClick={updateRenderer}>Update Renderer</button>
 * 		</div>
 * 	);
 * }
 * ```
 */
export const usePreferences: UseStore<PreferencesState> = create<PreferencesState>(
	(set, get) => ({
		preferences: {},
		setValue: (group, preference, newValue) =>
			set(state => setPrefValue(state, group, preference, 'value', newValue)),
		setRenderer: (group, preference, newRenderer) =>
			set(state =>
				setPrefValue(state, group, preference, 'renderer', newRenderer)
			),
		removePreference: (group, preference) => {
			const currentStore = get().preferences;
			// group is empty -> no preference to delete, return
			if (isEmpty(currentStore[group] || {})) return;

			const newGroup: PreferencesGroup = { ...currentStore[group] };
			delete newGroup[preference];

			const newStore: PreferencesStore = { ...currentStore, [group]: newGroup };
			if (isEmpty(newGroup)) delete newStore[group];

			set({ preferences: newStore });
		},
		removeGroup: group => {
			const newStore = { ...get().preferences };
			delete newStore[group];
			set({ preferences: newStore });
		},
		setStore: newStore => {
			set({ preferences: newStore });
		}
	})
);

/**
 * Returns a {@link PreferencesState}, based on the `currentState`, with `[key]` set to `value` on the preference
 * `preference` in the group `group`.
 *
 * @param currentState - the current state
 * @param group - the selector of the group the preference is in.
 * @param preference - the name of the preference
 * @param key - the key of the value that gets updated. Either `'value'` or `'renderer'`
 * @param value - the new value
 *
 * @returns the new state, including the applied changes.
 *
 * @example
 * ```ts
 * setValue: (group, preference, newValue) =>
 *   set(
 *     state => setPrefValue(state, group, preference, 'value', newValue)
 *   ),
 * ```
 */
function setPrefValue(
	currentState: PreferencesState,
	group: GroupSelector,
	preference: PrefSelector,
	key: 'value' | 'renderer',
	value: any
) {
	const currentStore = currentState.preferences;
	const currentGroup = currentStore[group];

	const newPreference: Preference = {
		// check if group already defined to avoid TypeError
		...(currentGroup ? currentGroup[preference] : undefined)
	};

	newPreference[key] = value;

	const newPreferences: PreferencesStore = {
		...currentStore,
		[group]: {
			...currentStore[group],
			[preference]: newPreference
		}
	};

	return { preferences: newPreferences };
}
