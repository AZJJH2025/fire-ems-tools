import { configureStore } from '@reduxjs/toolkit';
import formatterReducer from './formatterSlice';
import analyzerReducer from './analyzerSlice';
import fireMapProReducer from './fireMapProSlice';
import tankZoneCoverageReducer from './tankZoneCoverageSlice';
import waterSupplyCoverageReducer from './waterSupplyCoverageSlice';

export const store = configureStore({
  reducer: {
    formatter: formatterReducer,
    analyzer: analyzerReducer,
    fireMapPro: fireMapProReducer,
    tankZoneCoverage: tankZoneCoverageReducer, // Legacy support
    waterSupplyCoverage: waterSupplyCoverageReducer,
  },
});

// Make store accessible for debugging
if (typeof window !== 'undefined') {
  (window as any).__REDUX_STORE__ = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;