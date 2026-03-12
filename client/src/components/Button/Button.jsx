import './Button.css';

const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
    return (
        <button 
            type={type} 
            onClick={onClick} 
            className={`btn-primary ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
