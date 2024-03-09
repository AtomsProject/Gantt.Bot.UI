import React from 'react';

interface InputTextFieldProps {
    name: string;
    value?: string;
    displayName: string;
    onChange: (name: string, value: string) => void; // You can adjust the signature if necessary
    required?: boolean;
    className?: string;
}

const InputTextField: React.FC<InputTextFieldProps> = ({name, value, displayName, onChange, required = false, className}) => {
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Call the passed onChange function with name and value
        onChange(name, event.target.value);
    };

    return (
        <div className={`relative z-0 group ${className}`}>
            <input
                type="text"
                name={name}
                value={value}
                autoComplete="off"
                onChange={handleInputChange}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required={required}
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

export default InputTextField;
