import { configureStore, combineReducers } from '@reduxjs/toolkit';
import formatterReducer from './formatterSlice';
import analyzerReducer from './analyzerSlice';
import fireMapProReducer from './fireMapProSlice';
import tankZoneCoverageReducer from './tankZoneCoverageSlice';
import waterSupplyCoverageReducer from './waterSupplyCoverageSlice';

export const rootReducer = combineReducers({
  formatter: formatterReducer,
  analyzer: analyzerReducer,
  fireMapPro: fireMapProReducer,
  tankZoneCoverage: tankZoneCoverageReducer, // Legacy support
  waterSupplyCoverage: waterSupplyCoverageReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

// Make store accessible for debugging
if (typeof window !== 'undefined') {
  (window as any).__REDUX_STORE__ = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;