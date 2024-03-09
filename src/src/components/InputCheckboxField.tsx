import React from 'react';

interface InputCheckboxFieldProps {
    name: string;
    checked?: boolean;
    displayName: string;
    onChange: (name: string, checked: boolean) => void;
}

const InputCheckboxField: React.FC<InputCheckboxFieldProps> = ({name, checked = false, displayName, onChange}) => {
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.name, event.target.checked);
    };

    return (
        <div className="relative group">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                id={name}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 peer"
            />
            <label
                htmlFor={name}
                className="pl-1.5 peer-focus:font-medium text-sm text-gray-600 dark:text-gray-300 duration-300 peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500"
            >
                {displayName}
            </label>
        </div>
    );
};

export default InputCheckboxField;