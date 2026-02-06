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
  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      hoverBackgroundColor: '#0056b3',
      disabledBackgroundColor: '#6c757d',
    },
    secondary: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      hoverBackgroundColor: '#545b62',
      disabledBackgroundColor: '#adb5bd',
    },
    danger: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      hoverBackgroundColor: '#c82333',
      disabledBackgroundColor: '#e0a0a5',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#007bff',
      border: '1px solid #007bff',
      hoverBackgroundColor: '#007bff',
      hoverColor: 'white',
      disabledBackgroundColor: 'transparent',
      disabledColor: '#6c757d',
      disabledBorder: '#6c757d',
    },
  };

  // Size styles
  const sizeStyles = {
    small: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
    },
    medium: {
      padding: '0.5rem 1rem',
      fontSize: '1rem',
    },
    large: {
      padding: '0.75rem 1.5rem',
      fontSize: '1.125rem',
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
