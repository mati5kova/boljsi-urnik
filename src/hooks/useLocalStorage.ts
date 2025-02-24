/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

const useLocalStorage = (key: string, defaultValue: any) => {
	const [localStorageValue, setLocalStorageValue] = useState(() => {
		try {
			const value = localStorage.getItem(key);
			// če je vrednost prisotna jo vrni

			// če ni, nastavi in nato vrni
			if (value) {
				return JSON.parse(value);
			} else {
				localStorage.setItem(key, JSON.stringify(defaultValue));
				return defaultValue;
			}
		} catch (error: unknown) {
			localStorage.setItem(key, JSON.stringify(defaultValue));
			console.warn(error);
			return defaultValue;
		}
	});

	// updajtaj localstorage in stanje
	const setLocalStorageStateValue = (valueOrFn: any) => {
		let newValue;
		if (typeof valueOrFn === "function") {
			const fn = valueOrFn;
			newValue = fn(localStorageValue);
		} else {
			newValue = valueOrFn;
		}
		localStorage.setItem(key, JSON.stringify(newValue));
		setLocalStorageValue(newValue);
	};
	return [localStorageValue, setLocalStorageStateValue];
};

export default useLocalStorage;
