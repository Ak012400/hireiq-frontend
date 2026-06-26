import { createSlice } from '@reduxjs/toolkit';

const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    setResumes(state, { payload }) { state.list = payload; },
    setCurrent(state, { payload }) { state.current = payload; },
    setLoading(state, { payload }) { state.loading = payload; },
    setError(state, { payload }) { state.error = payload; },
  },
});

export const { setResumes, setCurrent, setLoading, setError } = resumeSlice.actions;
export const selectResumes = (s) => s.resume.list;
export const selectCurrentResume = (s) => s.resume.current;
export default resumeSlice.reducer;
