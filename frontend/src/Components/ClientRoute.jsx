import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SideBar from './AdminComponents/Sidebar';

const ClientRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.role === "client" ? (
    <div className="box">
      <SideBar />
      <div className="w-full pt-4 px-4 sm:px-6 md:px-8 lg:ps-72">
        <Outlet />
      </div>
    </div>
  ) : (
    <Navigate to='/' replace />
  );
};
export default ClientRoute;