import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import resumeReducer from '../features/resume/store/resumeSlice';
import jobsReducer from '../features/jobs/store/jobsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    jobs: jobsReducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});
