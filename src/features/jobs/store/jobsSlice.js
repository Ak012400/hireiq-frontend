import { createSlice } from '@reduxjs/toolkit';

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: { list: [], filters: { search: '', location: '' } },
  reducers: {
    setJobs(state, { payload }) { state.list = payload; },
    setFilters(state, { payload }) { state.filters = { ...state.filters, ...payload }; },
  },
});

export const { setJobs, setFilters } = jobsSlice.actions;
export const selectJobs = (s) => s.jobs.list;
export const selectJobFilters = (s) => s.jobs.filters;
export default jobsSlice.reducer;
