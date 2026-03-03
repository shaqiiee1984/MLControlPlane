import React from 'react';

export function Button({ children, className = '', variant, ...rest }) {
    const base = 'px-3 py-2 rounded-md inline-flex items-center gap-2';
    return (
        <button {...rest} className={`${base} ${className}`}>{children}</button>
    );
}

export default Button;
