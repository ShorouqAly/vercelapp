import React, { createContext, useContext, useReducer } from 'react';

const ReviewMatchContext = createContext();

const initialState = {
  products: [],
  requests: [],
  analytics: null,
  loading: false,
  error: null
};

const reviewMatchReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_REQUESTS':
      return { ...state, requests: action.payload };
    // Add other actions
    default:
      return state;
  }
};

export const ReviewMatchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reviewMatchReducer, initialState);
  
  return (
    <ReviewMatchContext.Provider value={{ state, dispatch }}>
      {children}
    </ReviewMatchContext.Provider>
  );
};

export const useReviewMatch = () => {
  const context = useContext(ReviewMatchContext);
  if (!context) {
    throw new Error('useReviewMatch must be used within ReviewMatchProvider');
  }
  return context;
};
