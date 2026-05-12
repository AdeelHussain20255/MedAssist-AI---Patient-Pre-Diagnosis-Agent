import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    
    let variantStyles = "";
    switch (variant) {
      case 'primary':
        variantStyles = "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 border border-transparent";
        break;
      case 'secondary':
        variantStyles = "bg-brand-100 text-brand-700 hover:bg-brand-200 active:bg-brand-300 border border-transparent";
        break;
      case 'outline':
        variantStyles = "bg-transparent text-content-primary border-2 border-gray-200 hover:border-gray-300 active:bg-gray-50";
        break;
      case 'ghost':
        variantStyles = "bg-transparent text-content-secondary hover:bg-gray-100 active:bg-gray-200 border border-transparent";
        break;
      case 'danger':
        variantStyles = "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent";
        break;
      case 'emergency':
        variantStyles = "btn-emergency w-full"; // Uses our global.css class
        break;
    }

    let sizeStyles = "";
    switch (size) {
      case 'sm': sizeStyles = "px-3 py-1.5 text-sm"; break;
      case 'md': sizeStyles = "px-4 py-2 text-base"; break;
      case 'lg': sizeStyles = "px-6 py-3 text-lg"; break;
    }

    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg";
    
    return (
      <button
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
