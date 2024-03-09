import React from 'react';

interface DateInputFieldProps {
    name: string;
    value: Date | undefined;
    displayName: string;
    onChange: (name: string, value: Date | undefined) => void;
    required?: boolean;
    min?: Date;
    max?: Date;
}

const InputDateField: React.FC<DateInputFieldProps> = (
    {
        name,
        value,
        displayName,
        onChange,
        required = false,
        min,
        max
    }) => {
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Update the date value using the onChange callback from props
        onChange(name, event.target.value ? new Date(event.target.value) : undefined);
    };

    return (
        <div className='group relative z-0'>
            <input
                type="date"
                id={name}
                name={name}
                value={value instanceof Date ? value.toISOString().slice(0, 10) : ''}
                onChange={handleDateChange}
                className="input-active peer"
                required={required}
                min={min instanceof Date ? min.toISOString().slice(0, 10) : undefined}
                max={max instanceof Date ? max.toISOString().slice(0, 10) : undefined}
            />
            <label htmlFor={name} className="input-label-sm duration-300 peer-focus:text-blue-600">{displayName}</label>

        </div>
    );
};

export default InputDateField;
