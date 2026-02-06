import React from 'react';

/**
 * Reusable Button component with variants and disabled state
 * 
 * @param {string} variant - Button style variant: 'primary', 'secondary', 'danger', 'outline'
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} size - Button size: 'small', 'medium', 'large'
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {function} onClick - Click handler function
 * @param {React.ReactNode} children - Button content
 * @param {string} type - Button type: 'button', 'submit', 'reset'
 * @param {object} style - Additional inline styles
 * @param {string} className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  disabled = false,
  size = 'medium',
  fullWidth = false,
  onClick,
  children,
  type = 'button',
  style = {},
  className = '',
  ...props
}) => {
  // Variant styles – minimal palette
  const variantStyles = {
    primary: {
      backgroundColor: '#475569',
      color: '#fff',
      border: 'none',
      hoverBackgroundColor: '#334155',
      disabledBackgroundColor: '#cbd5e1',
    },
    secondary: {
      backgroundColor: '#64748b',
      color: '#fff',
      border: 'none',
      hoverBackgroundColor: '#475569',
      disabledBackgroundColor: '#cbd5e1',
    },
    danger: {
      backgroundColor: '#b91c1c',
      color: '#fff',
      border: 'none',
      hoverBackgroundColor: '#991b1b',
      disabledBackgroundColor: '#fecaca',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#475569',
      border: '1px solid #e2e8f0',
      hoverBackgroundColor: '#f1f5f9',
      hoverColor: '#0f172a',
      disabledBackgroundColor: 'transparent',
      disabledColor: '#94a3b8',
      disabledBorder: '#e2e8f0',
    },
  };

  // Size styles – compact
  const sizeStyles = {
    small: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.8125rem',
    },
    medium: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
    },
    large: {
      padding: '0.625rem 1.25rem',
      fontSize: '0.9375rem',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;
  const currentSize = sizeStyles[size] || sizeStyles.medium;

  const baseStyle = {
    ...currentSize,
    backgroundColor: disabled ? currentVariant.disabledBackgroundColor : currentVariant.backgroundColor,
    color: disabled 
      ? (currentVariant.disabledColor || currentVariant.color)
      : currentVariant.color,
    border: disabled && currentVariant.disabledBorder
      ? `1px solid ${currentVariant.disabledBorder}`
      : currentVariant.border || 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const handleMouseEnter = (e) => {
    if (!disabled && currentVariant.hoverBackgroundColor) {
      e.target.style.backgroundColor = currentVariant.hoverBackgroundColor;
      if (currentVariant.hoverColor) {
        e.target.style.color = currentVariant.hoverColor;
      }
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.target.style.backgroundColor = currentVariant.backgroundColor;
      e.target.style.color = currentVariant.color;
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={baseStyle}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
