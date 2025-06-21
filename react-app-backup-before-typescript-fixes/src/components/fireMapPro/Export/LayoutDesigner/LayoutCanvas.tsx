import React, { useRef, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../state/redux/store';
import { updateLayoutElement, selectLayoutElement, addLayoutElement } from '../../../../state/redux/fireMapProSlice/index';
import { LayoutElement } from '../../../../types/export';

interface LayoutCanvasProps {
  width?: number;
  height?: number;
}

const LayoutCanvas: React.FC<LayoutCanvasProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const dispatch = useDispatch();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { layoutElements, selectedElementId, paperSize } = useSelector((state: RootState) => ({
    layoutElements: state.fireMapPro.export.configuration.layout.elements,
    selectedElementId: state.fireMapPro.export.configuration.layout.selectedElementId,
    paperSize: state.fireMapPro.export.configuration.basic.paperSize
  }));

  const paperDimensions = {
    'letter': { width: 8.5, height: 11 },
    'legal': { width: 8.5, height: 14 },
    'tabloid': { width: 11, height: 17 },
    'a4': { width: 8.27, height: 11.69 },
    'a3': { width: 11.69, height: 16.54 },
    'custom': { width: 8.5, height: 11 }
  };

  const paper = paperDimensions[paperSize as keyof typeof paperDimensions] || paperDimensions.letter;
  const aspectRatio = paper.width / paper.height;
  const canvasHeight = Math.min(height, width / aspectRatio);
  const canvasWidth = canvasHeight * aspectRatio;

  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(selectLayoutElement(elementId));
  };

  const handleCanvasClick = () => {
    dispatch(selectLayoutElement(null));
  };

  const handleElementDrag = (elementId: string, deltaX: number, deltaY: number) => {
    const element = layoutElements.find(el => el.id === elementId);
    if (!element) return;

    const newX = Math.max(0, Math.min(100, element.x + (deltaX / canvasWidth) * 100));
    const newY = Math.max(0, Math.min(100, element.y + (deltaY / canvasHeight) * 100));

    dispatch(updateLayoutElement({
      id: elementId,
      updates: { x: newX, y: newY }
    }));
  };

  // Handle dropping new elements from toolbox
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    try {
      const data = event.dataTransfer.getData('application/json');
      if (!data) return;
      
      const dragData = JSON.parse(data);
      if (dragData.type !== 'layout-element') return;

      // Calculate drop position relative to canvas
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const x = ((event.clientX - canvasRect.left) / canvasRect.width) * 100;
      const y = ((event.clientY - canvasRect.top) / canvasRect.height) * 100;

      // Create new element with default size
      const newElement = {
        type: dragData.elementType,
        x: Math.max(0, Math.min(95, x - 5)), // Offset to center on cursor
        y: Math.max(0, Math.min(95, y - 5)),
        width: 20, // Default width
        height: 15, // Default height
        zIndex: layoutElements.length + 1,
        visible: true,
        content: getDefaultContent(dragData.elementType)
      };

      dispatch(addLayoutElement(newElement));
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const getDefaultContent = (elementType: string) => {
    switch (elementType) {
      case 'title':
        return { text: 'Map Title', fontSize: 18, textAlign: 'center' as const, color: '#333333', fontFamily: 'Arial' };
      case 'subtitle':
        return { text: 'Map Subtitle', fontSize: 14, textAlign: 'center' as const, color: '#666666', fontFamily: 'Arial' };
      case 'text':
        return { text: 'Text Element', fontSize: 12, textAlign: 'left' as const, color: '#333333', fontFamily: 'Arial' };
      case 'legend':
        return { text: 'Legend', backgroundColor: '#ffffff', color: '#333333' };
      case 'image':
        return { text: 'Image Placeholder', backgroundColor: '#f5f5f5' };
      case 'shape':
        return { backgroundColor: 'transparent', borderColor: '#333333' };
      default:
        return {};
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'map': return '🗺️';
      case 'title': return '📝';
      case 'subtitle': return '📄';
      case 'legend': return '📋';
      case 'north-arrow': return '🧭';
      case 'scale-bar': return '📏';
      case 'text': return '💬';
      case 'image': return '🖼️';
      case 'shape': return '⬜';
      default: return '📦';
    }
  };

  const getElementLabel = (type: string) => {
    switch (type) {
      case 'map': return 'Map Frame';
      case 'title': return 'Title';
      case 'subtitle': return 'Subtitle';
      case 'legend': return 'Legend';
      case 'north-arrow': return 'North Arrow';
      case 'scale-bar': return 'Scale Bar';
      case 'text': return 'Text Box';
      case 'image': return 'Image';
      case 'shape': return 'Shape';
      default: return 'Element';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: 2,
      height: '100%',
      backgroundColor: '#f5f5f5'
    }}>
      <Paper
        ref={canvasRef}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          position: 'relative',
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: 'white',
          border: '2px solid #ddd',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          cursor: 'default'
        }}
      >
        {/* Paper size indicator */}
        <Box sx={{
          position: 'absolute',
          top: -25,
          left: 0,
          fontSize: '12px',
          color: '#666',
          fontWeight: 'bold'
        }}>
          {paperSize.toUpperCase()} ({paper.width}" × {paper.height}")
        </Box>

        {/* Grid overlay */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0.1
          }}
        >
          <defs>
            <pattern
              id="grid"
              width={canvasWidth / 10}
              height={canvasHeight / 10}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${canvasWidth / 10} 0 L 0 0 0 ${canvasHeight / 10}`}
                fill="none"
                stroke="#666"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Layout elements */}
        {layoutElements.map((element) => (
          <LayoutElementComponent
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onElementClick={handleElementClick}
            onElementDrag={handleElementDrag}
            getElementIcon={getElementIcon}
            getElementLabel={getElementLabel}
          />
        ))}

        {/* Selection indicator */}
        {layoutElements.length === 0 && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#999'
          }}>
            <Box sx={{ fontSize: '48px', marginBottom: 1 }}>📄</Box>
            <Box sx={{ fontSize: '14px' }}>
              Drag elements from the toolbox to create your layout
            </Box>
          </Box>
        )}
      </Paper>

      {/* Canvas info */}
      <Box sx={{ 
        marginTop: 1, 
        fontSize: '12px', 
        color: '#666',
        textAlign: 'center'
      }}>
        Canvas: {Math.round(canvasWidth)}×{Math.round(canvasHeight)}px | 
        Zoom: {Math.round((canvasWidth / 400) * 100)}% |
        Elements: {layoutElements.length}
      </Box>
    </Box>
  );
};

interface LayoutElementComponentProps {
  element: LayoutElement;
  isSelected: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onElementClick: (elementId: string, event: React.MouseEvent) => void;
  onElementDrag: (elementId: string, deltaX: number, deltaY: number) => void;
  getElementIcon: (type: string) => string;
  getElementLabel: (type: string) => string;
}

const LayoutElementComponent: React.FC<LayoutElementComponentProps> = ({
  element,
  isSelected,
  canvasWidth,
  canvasHeight,
  onElementClick,
  onElementDrag,
  getElementIcon,
  getElementLabel
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    isDragging.current = true;
    dragStart.current = { x: event.clientX, y: event.clientY };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;
      
      onElementDrag(element.id, deltaX, deltaY);
      
      dragStart.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    onElementClick(element.id, event);
  };

  if (!element.visible) return null;

  const style = {
    position: 'absolute' as const,
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    zIndex: element.zIndex,
    border: isSelected ? '2px solid #1976d2' : '1px solid #ddd',
    backgroundColor: element.type === 'map' ? '#e3f2fd' : 'rgba(255,255,255,0.9)',
    cursor: 'move',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
    userSelect: 'none' as const,
    boxSizing: 'border-box' as const
  };

  return (
    <div
      ref={elementRef}
      style={style}
      onMouseDown={handleMouseDown}
      onClick={(e) => onElementClick(element.id, e)}
    >
      <Box sx={{ textAlign: 'center', overflow: 'hidden', padding: 0.5 }}>
        {/* Show actual text content for text-based elements */}
        {(element.type === 'title' || element.type === 'subtitle' || element.type === 'text' || element.type === 'legend') && element.content?.text ? (
          <Box sx={{ 
            fontSize: `${Math.max(8, Math.min(16, (element.content?.fontSize || 12) * 0.8))}px`,
            fontFamily: element.content?.fontFamily || 'Arial',
            color: element.content?.color || '#333',
            textAlign: element.content?.textAlign || (element.type === 'title' ? 'center' : 'left'),
            fontWeight: element.type === 'title' ? 'bold' : 'normal',
            lineHeight: 1.2,
            wordBreak: 'break-word',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            backgroundColor: element.type === 'legend' ? (element.content?.backgroundColor || '#ffffff') : 'transparent',
            border: element.type === 'legend' ? '1px solid #ddd' : 'none',
            borderRadius: element.type === 'legend' ? '2px' : '0',
            padding: element.type === 'legend' ? '2px 4px' : '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: element.content?.textAlign === 'center' ? 'center' : (element.content?.textAlign === 'right' ? 'flex-end' : 'flex-start')
          }}>
            {element.content.text}
          </Box>
        ) : (
          // Show icon and label for other elements or empty text elements
          <>
            <Box sx={{ fontSize: '16px', marginBottom: 0.5 }}>
              {getElementIcon(element.type)}
            </Box>
            <Box sx={{ fontSize: '10px', lineHeight: 1 }}>
              {getElementLabel(element.type)}
            </Box>
          </>
        )}
      </Box>
      
      {/* Selection handles */}
      {isSelected && (
        <>
          {/* Corner resize handles */}
          <div style={{
            position: 'absolute',
            top: -4,
            left: -4,
            width: 8,
            height: 8,
            backgroundColor: '#1976d2',
            cursor: 'nw-resize'
          }} />
          <div style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 8,
            height: 8,
            backgroundColor: '#1976d2',
            cursor: 'ne-resize'
          }} />
          <div style={{
            position: 'absolute',
            bottom: -4,
            left: -4,
            width: 8,
            height: 8,
            backgroundColor: '#1976d2',
            cursor: 'sw-resize'
          }} />
          <div style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 8,
            height: 8,
            backgroundColor: '#1976d2',
            cursor: 'se-resize'
          }} />
        </>
      )}
    </div>
  );
};

export default LayoutCanvas;