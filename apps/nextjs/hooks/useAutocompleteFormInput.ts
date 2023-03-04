import { SyntheticEvent, useState } from 'react';

const useAutocompleteFormInput = (initialValue: string) => {
	const [value, setValue] = useState<string | undefined>(initialValue);
	const [inputValue, setInputValue] = useState<string | undefined>(initialValue);

	const handleChange = (_e: SyntheticEvent<Element, Event>, newValue: string | null) => {
		if (newValue === null) {
			setValue(undefined)
		} else {
			setValue(newValue);
		}
	};

	const handleInputChange = (_e: SyntheticEvent<Element, Event>, newInputValue: string | null) => {
		if (newInputValue === null) {
			setInputValue(undefined)
		} else {
			setInputValue(newInputValue);
		}
	};

	const reset = () => {
		setValue(initialValue);
		setInputValue(initialValue);
	};

	const setInputValueManually = (newInputValue: string) => {
		setInputValue(newInputValue);
	}

	return {
		value,
		onChange: handleChange,
		inputValue,
		onInputChange: handleInputChange,
		reset,
		setInputValue: setInputValueManually,
	};
};

export default useAutocompleteFormInput;