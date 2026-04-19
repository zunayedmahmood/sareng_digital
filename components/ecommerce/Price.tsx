'use client';

import React from 'react';

interface PriceProps {
  amount: number | string;
  className?: string;
  showSymbol?: boolean;
}

const Price: React.FC<PriceProps> = ({ amount, className = '', showSymbol = true }) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return <span className={className}>—</span>;
  }

  const formattedAmount = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);

  return (
    <span className={className}>
      {showSymbol && <span className="mr-0.5">৳</span>}
      {formattedAmount}
    </span>
  );
};

export default Price;
