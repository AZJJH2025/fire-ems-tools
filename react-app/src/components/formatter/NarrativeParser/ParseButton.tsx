/**
 * Parse Button Component
 * 
 * Button that appears next to text columns to trigger narrative parsing
 */

import React from 'react';
import {
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  AutoFixHigh as MagicIcon
} from '@mui/icons-material';

export interface ParseButtonProps {
  columnName: string;
  onClick: (columnName: string) => void;
  variant?: 'icon' | 'button';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const ParseButton: React.FC<ParseButtonProps> = ({
  columnName,
  onClick,
  variant = 'icon',
  size = 'small',
  disabled = false
}) => {
  const handleClick = () => {
    onClick(columnName);
  };

  if (variant === 'button') {
    return (
      <Button
        size={size}
        startIcon={<MagicIcon />}
        onClick={handleClick}
        disabled={disabled}
        sx={{
          minWidth: 'auto',
          textTransform: 'none',
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.50'
          }
        }}
      >
        Parse
      </Button>
    );
  }

  return (
    <Tooltip title={`Parse narrative text in "${columnName}" column`}>
      <span>
        <IconButton
          size={size}
          onClick={handleClick}
          disabled={disabled}
          sx={{
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.50',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <MagicIcon fontSize={size} />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default ParseButton;