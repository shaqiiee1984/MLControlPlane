import React from 'react';

export function Input(props) {
    const { className = '', ...rest } = props;
    return (
        <input {...rest} className={`${className} px-3 py-2 rounded-md border border-[#27272a] bg-[#18181b] text-white`} />
    );
}

export default Input;
