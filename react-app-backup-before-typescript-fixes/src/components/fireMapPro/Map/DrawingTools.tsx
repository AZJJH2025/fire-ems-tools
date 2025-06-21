/**
 * Drawing Tools Component
 * 
 * Handles interactive drawing tools for creating map features.
 */

import React, { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import * as L from 'leaflet';

import {
  selectDrawingState,
  selectLayers,
  addFeature,
  setDrawingMode
} from '@/state/redux/fireMapProSlice';
import { MapFeature, FeatureType } from '@/types/fireMapPro';

const DrawingTools: React.FC = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const drawingState = useSelector(selectDrawingState);
  const layers = useSelector(selectLayers);
  const [drawingPoints, setDrawingPoints] = React.useState<L.LatLng[]>([]);
  const [tempLayer, setTempLayer] = React.useState<L.Layer | null>(null);

  // Get the first feature layer as default target
  const targetLayer = layers.find(layer => layer.type === 'feature');

  useMapEvents({
    click: (e) => {
      if (!drawingState.mode || !targetLayer) return;

      const { lat, lng } = e.latlng;

      switch (drawingState.mode) {
        case 'marker':
          handleMarkerCreate(lat, lng);
          break;
        case 'polyline':
          handlePolylineClick(e.latlng);
          break;
        case 'polygon':
          handlePolygonClick(e.latlng);
          break;
        case 'circle':
          handleCircleStart(e.latlng);
          break;
        case 'rectangle':
          handleRectangleStart(e.latlng);
          break;
        default:
          break;
      }
    },
    mousemove: (e) => {
      if (drawingState.mode === 'polyline' || drawingState.mode === 'polygon') {
        updateTempLine(e.latlng);
      }
    },
    dblclick: () => {
      if (drawingState.mode === 'polyline') {
        finishPolyline();
      } else if (drawingState.mode === 'polygon') {
        finishPolygon();
      }
    }
  });

  const handleMarkerCreate = (lat: number, lng: number) => {
    if (!targetLayer) return;

    const newFeature: Omit<MapFeature, 'id' | 'created' | 'modified'> = {
      type: 'marker',
      title: 'New Marker',
      description: 'Click to edit',
      coordinates: [lng, lat],
      style: drawingState.options.style,
      properties: {},
      layerId: targetLayer.id
    };

    dispatch(addFeature({
      layerId: targetLayer.id,
      feature: newFeature
    }));
  };

  const handlePolylineClick = (latlng: L.LatLng) => {
    const newPoints = [...drawingPoints, latlng];
    setDrawingPoints(newPoints);
    updateTempLine(latlng);
  };

  const handlePolygonClick = (latlng: L.LatLng) => {
    const newPoints = [...drawingPoints, latlng];
    setDrawingPoints(newPoints);
    updateTempLine(latlng);
  };

  const handleCircleStart = (latlng: L.LatLng) => {
    // For circle, we use click and drag - implement radius drawing
    const circle = L.circle(latlng, {
      radius: 100,
      ...drawingState.options.style
    }).addTo(map);
    
    setTimeout(() => {
      finishCircle(latlng, 100);
      map.removeLayer(circle);
    }, 100);
  };

  const handleRectangleStart = (latlng: L.LatLng) => {
    // For rectangle, create a default sized rectangle
    const bounds = L.latLngBounds(latlng, [latlng.lat + 0.001, latlng.lng + 0.001]);
    finishRectangle(bounds);
  };

  const updateTempLine = (currentPoint: L.LatLng) => {
    if (tempLayer) {
      map.removeLayer(tempLayer);
    }
    
    if (drawingPoints.length > 0) {
      const points = [...drawingPoints, currentPoint];
      const tempPolyline = L.polyline(points, {
        ...drawingState.options.style,
        dashArray: '5, 5',
        opacity: 0.7
      }).addTo(map);
      setTempLayer(tempPolyline);
    }
  };

  const finishPolyline = () => {
    if (drawingPoints.length < 2 || !targetLayer) return;
    
    const coordinates = drawingPoints.map(p => [p.lng, p.lat]);
    const newFeature: Omit<MapFeature, 'id' | 'created' | 'modified'> = {
      type: 'polyline',
      title: 'New Line',
      description: 'Click to edit',
      coordinates,
      style: drawingState.options.style,
      properties: {},
      layerId: targetLayer.id
    };

    dispatch(addFeature({
      layerId: targetLayer.id,
      feature: newFeature
    }));

    resetDrawing();
  };

  const finishPolygon = () => {
    if (drawingPoints.length < 3 || !targetLayer) return;
    
    const coordinates = [...drawingPoints.map(p => [p.lng, p.lat]), drawingPoints[0] && [drawingPoints[0].lng, drawingPoints[0].lat]].filter(Boolean);
    const newFeature: Omit<MapFeature, 'id' | 'created' | 'modified'> = {
      type: 'polygon',
      title: 'New Polygon',
      description: 'Click to edit',
      coordinates,
      style: drawingState.options.style,
      properties: {},
      layerId: targetLayer.id
    };

    dispatch(addFeature({
      layerId: targetLayer.id,
      feature: newFeature
    }));

    resetDrawing();
  };

  const finishCircle = (center: L.LatLng, radius: number) => {
    if (!targetLayer) return;
    
    const newFeature: Omit<MapFeature, 'id' | 'created' | 'modified'> = {
      type: 'circle',
      title: 'New Circle',
      description: 'Click to edit',
      coordinates: [center.lng, center.lat, radius],
      style: drawingState.options.style,
      properties: {},
      layerId: targetLayer.id
    };

    dispatch(addFeature({
      layerId: targetLayer.id,
      feature: newFeature
    }));
  };

  const finishRectangle = (bounds: L.LatLngBounds) => {
    if (!targetLayer) return;
    
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const coordinates = [[sw.lng, sw.lat], [ne.lng, ne.lat]];
    
    const newFeature: Omit<MapFeature, 'id' | 'created' | 'modified'> = {
      type: 'rectangle',
      title: 'New Rectangle', 
      description: 'Click to edit',
      coordinates,
      style: drawingState.options.style,
      properties: {},
      layerId: targetLayer.id
    };

    dispatch(addFeature({
      layerId: targetLayer.id,
      feature: newFeature
    }));
  };

  const resetDrawing = () => {
    setDrawingPoints([]);
    if (tempLayer) {
      map.removeLayer(tempLayer);
      setTempLayer(null);
    }
  };

  // Reset drawing when mode changes
  React.useEffect(() => {
    resetDrawing();
  }, [drawingState.mode]);

  // Set cursor style based on drawing mode
  useEffect(() => {
    if (!map) return;

    const mapContainer = map.getContainer();
    if (drawingState.mode) {
      mapContainer.style.cursor = 'crosshair';
    } else {
      mapContainer.style.cursor = '';
    }

    return () => {
      mapContainer.style.cursor = '';
    };
  }, [map, drawingState.mode]);

  return null;
};

export default DrawingTools;