import React, { ReactNode } from 'react';
import {
  Tooltip,
  TooltipProps,
  styled,
  Paper,
  Typography,
  Box
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Custom tooltip with enhanced styling
const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: 'transparent',
    padding: 0,
    maxWidth: 320
  }
}));

// Enhanced content container
const TooltipContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  minWidth: 200,
  maxWidth: 320
}));

// Title style for tooltips
const TooltipTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(0.5),
  color: theme.palette.primary.main
}));

// Different tooltip types for different contexts
type TooltipType = 'info' | 'help' | 'warning' | 'tip';

export interface EnhancedTooltipProps {
  title: string;
  children: React.ReactElement;
  content: ReactNode;
  type?: TooltipType;
  icon?: boolean;
  placement?: TooltipProps['placement'];
  enterDelay?: number;
  leaveDelay?: number;
}

/**
 * Enhanced tooltip component with rich content support
 * 
 * @example
 * <EnhancedTooltip
 *   title="Drag and Drop"
 *   content={<>
 *     <Typography variant="body2">
 *       Drag fields from the source panel and drop them onto target fields.
 *     </Typography>
 *     <Box sx={{ mt: 1 }}>
 *       <img src="/static/tooltips/drag-drop.gif" alt="Drag and drop example" width="100%" />
 *     </Box>
 *   </>}
 * >
 *   <Button>Map Fields</Button>
 * </EnhancedTooltip>
 */
const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  title,
  children,
  content,
  type = 'info',
  icon = false,
  placement = 'top',
  enterDelay = 100,
  leaveDelay = 100
}) => {
  // Debug log - remove in production
  console.log(`EnhancedTooltip rendering: ${title} with icon=${icon}`);
  // If icon is true, we wrap the children with the help icon
  const wrappedChildren = icon ? (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <HelpOutlineIcon 
        color="action" 
        fontSize="small" 
        sx={{ ml: 0.5, opacity: 0.7 }} 
      />
    </Box>
  ) : children;

  return (
    <StyledTooltip
      title={
        <TooltipContent>
          <TooltipTitle variant="subtitle2">{title}</TooltipTitle>
          {content}
        </TooltipContent>
      }
      placement={placement}
      arrow
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
    >
      {wrappedChildren}
    </StyledTooltip>
  );
};

export default EnhancedTooltip;