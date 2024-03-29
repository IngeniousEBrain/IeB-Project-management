import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import SideBar from "./Sidebar";

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.is_staff ? (
    <div className="box">
      <SideBar />
      <div className="w-full pt-10 px-4 sm:px-6 md:px-8 lg:ps-72">
        <Outlet />
      </div>
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};
export default AdminRoute;
