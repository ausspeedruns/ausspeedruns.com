import { useState } from 'react';

const useAutocompleteFormInput = (initialValue: string) => {
	const [value, setValue] = useState<string | null>(initialValue);
	const [inputValue, setInputValue] = useState<string>(initialValue);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, newValue: string) => {
		setValue(newValue);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, newInputValue: string) => {
		setInputValue(newInputValue);
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