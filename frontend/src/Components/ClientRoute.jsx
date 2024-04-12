import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ClientRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.role === "client" ? (
    <Outlet />
  ) : (
    <Navigate to='/' replace />
  );
};
export default ClientRoute;