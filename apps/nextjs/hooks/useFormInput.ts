import { useState } from 'react';

interface FormInputState<T> {
	value: T;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	reset: () => void;
	setValue: (value: T) => void;
}

const useFormInput = <T>(initialValue: T) => {
	const [value, setValue] = useState<T>(initialValue);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value as unknown as T);
	};

	const reset = () => {
		setValue(initialValue);
	};

	const setValueManually = (newValue: T) => {
		setValue(newValue);
	}

	return {
		elementProps: {
			value,
			onChange: handleChange,
		},
		setValue: setValueManually,
		reset,
	};
};

export default useFormInput;