import { configureStore } from '@reduxjs/toolkit';
import formatterReducer from './formatterSlice';
import analyzerReducer from './analyzerSlice';
import fireMapProReducer from './fireMapProSlice';

export const store = configureStore({
  reducer: {
    formatter: formatterReducer,
    analyzer: analyzerReducer,
    fireMapPro: fireMapProReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;