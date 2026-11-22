import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer shimmer-btn-fx relative overflow-hidden';

  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-sm hover:shadow-lg hover:shadow-teal-500/30 active:bg-teal-800',
    secondary: 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 shadow-sm hover:shadow-lg hover:shadow-sky-500/30 active:bg-sky-800',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-teal-400 hover:text-teal-700 focus:ring-teal-500 shadow-2xs hover:shadow-md active:bg-slate-100',
    amber: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-sm hover:shadow-lg hover:shadow-amber-500/30 active:bg-amber-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-lg hover:shadow-red-500/30 active:bg-red-800',
    emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm hover:shadow-lg hover:shadow-emerald-500/30 active:bg-emerald-800',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 shadow-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5 font-bold',
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? undefined : { scale: 1.025, y: -2 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </motion.button>
  );
};

export const AnimatedIconButton = ({
  icon: Icon,
  label,
  onClick,
  active = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent',
    teal: 'text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80',
    red: 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/80',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -1 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 600, damping: 25 }}
      onClick={onClick}
      className={`p-2 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center ${variantStyles[variant] || variantStyles.default} ${className}`}
      title={label}
      aria-label={label}
      {...props}
    >
      <Icon className="w-4 h-4" />
      {label && <span className="sr-only">{label}</span>}
    </motion.button>
  );
};

export const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-soft ${
        hover ? 'hover:shadow-lifted hover:border-teal-200 transition-all' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Badge = ({ children, variant = 'teal', className = '' }) => {
  const badges = {
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badges[variant] || badges.teal} ${className}`}>
      {children}
    </span>
  );
};

export default Button;
