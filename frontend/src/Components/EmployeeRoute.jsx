import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const EmployeeRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && (userInfo.role === "project_manager" || userInfo.role === "key_account_holder") ? (
    <Outlet />
  ) : (
    <Navigate to='/login' replace />
  );
};
export default EmployeeRoute;