import React from 'react';

interface InputNumberFieldProps {
    name: string;
    value?: number;
    displayName: string;
    onChange: (name: string, value: number | undefined) => void; // You can adjust the signature if necessary
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
}

const InputNumberField: React.FC<InputNumberFieldProps> = ({
                                                               name,
                                                               value,
                                                               displayName,
                                                               onChange, required = false,
                                                               min = Number.MIN_SAFE_INTEGER,
                                                               max = Number.MAX_SAFE_INTEGER,
                                                               step = 1
                                                           }) => {
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        
        if (event.target.value.trim() === "") {
            if (required) {
                console.info("Invalid input: Input should not be empty, ignoring the change event");
            } else {
                onChange(name, undefined);
            }
            return
        }

        const numValue = Number(event.target.value);
        if (isNaN(numValue) || numValue < min || numValue > max) {
            console.warn("Invalid input: Input should be a number, ignoring the change event");
            event.target.value = value?.toString() || ""; // Maybe there's a better way to handle this, but this works for now
            return;
        }

        onChange(event.target.name, numValue);
    };

    return (
        <div className="relative z-0 group flex-1">
            <input
                type="number"
                name={name}
                value={value ?? ""}
               
                onChange={handleInputChange}
                className="block py-2 px-0 w-full text-xs text-gray-900 bg-transparent border-0 border-b border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required={required}
                min={min}
                max={max}
                step={step}
            />
            <label
                htmlFor={name}
                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
                {displayName}
            </label>
        </div>
    );
};

export default InputNumberField;
