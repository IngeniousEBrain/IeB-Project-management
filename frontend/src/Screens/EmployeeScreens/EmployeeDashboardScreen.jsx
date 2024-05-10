import React, { useEffect, useState } from "react";
import { useGetEmployeeRevenueQuery } from "../../slices/projectApiSlice";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import Loading from "../../Components/Loading";
import SideBar from "../../Components/AdminComponents/Sidebar";
import { useSelector } from "react-redux";

const EmployeeDashboardScreen = () => {
  const [open, setOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.auth)

  const { data, isLoading, error } = useGetEmployeeRevenueQuery(userInfo.email);

  const navigate = useNavigate();

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="">
          <div className="flex flex-row-reverse">
            {/* <button
                  className="m-2 p-2 flex gap-2 items-center border border-gray-400 rounded-md text-gray-600 font-semibold"
                  onClick={() => setOpen(!open)}
                >
                  <p>Filters</p>
                  <FaFilter />
                </button> */}

            {/* {customFilters && (
                  <button
                    className="m-2 p-2 flex gap-2 items-center border border-gray-400 rounded-md text-gray-600 font-semibold"
                    onClick={handleClear}
                  >
                    <p>Clear Filters</p>
                    <FaXmark />
                  </button>
                )}
                {open && (
                  <FiltersModal
                    overlayOpen={open}
                    closeOverlay={closeOverlay}
                  />
                )} */}
          </div>
          <h1 className="p-4 text-white text-center text-2xl bg-sky-950 font-bold">
            MIS Report
          </h1>

          <div className="my-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 text-white">
            <div className="h-40 sm:col-span-2 p-2 bg-sky-900 border rounded-md">
              <h3 className="text-lg">Total Proposals</h3>
              <p className="text-5xl text-center p-4 font-bold">
              {data?.data?.total_proposals}
              </p>
            </div>

            <div className="h-40 sm:col-span-2 p-2 bg-sky-900 border rounded-md">
              <h3 className="text-lg">Total Projects</h3>
              <p className="text-5xl text-center p-4 font-bold">
                {/* {filteredData?.data?.total_projects} */}{data?.data?.total_projects}
              </p>
            </div>

            <div className="h-40 sm:col-span-2 p-2 bg-sky-900 border rounded-md">
              <h3 className="text-lg">Total Revenue (in INR)</h3>
              <p className="text-5xl text-center p-4 font-bold">
                {/* {filteredData?.data?.total_revenue} */}{data?.data?.yearly_revenue}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeDashboardScreen;
