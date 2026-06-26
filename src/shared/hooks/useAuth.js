import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout, selectUser, selectToken, selectRole } from '../../features/auth/store/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  return {
    token: useAppSelector(selectToken),
    user: useAppSelector(selectUser),
    role: useAppSelector(selectRole),
    isAuthenticated: Boolean(useAppSelector(selectToken)),
    logout: () => dispatch(logout()),
  };
}
