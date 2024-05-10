import React, { useState } from "react";
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
import {
  useGetProposalStatusCountQuery,
  useGetfilteredResultsQuery,
} from "../../slices/projectApiSlice";
import Loading from "../../Components/Loading";
import RenderActiveShape from "../../Components/RenderActiveShape";
import { FaFilter, FaXmark } from "react-icons/fa6";
import FiltersModal from "../../Components/AdminComponents/FiltersModal";
import { useDispatch, useSelector } from "react-redux";
import { clearFilters } from "../../slices/filterSlice";

const AdminDashboardScreen = () => {
  const [open, setOpen] = useState(false);

  const { customFilters } = useSelector((state) => state.filters);

  // const { data: stockData, isLoading } = useGetProposalStatusCountQuery();
  const { data: filteredData, isLoading } =
    useGetfilteredResultsQuery(customFilters);

  const dispatch = useDispatch();

  const ProposalStatusColor = {
    accepted: "#22c55e",
    rejected: "#ef4444",
    on_hold: "#facc15",
    pending: "#38bdf8",
  };

  const closeOverlay = () => {
    setOpen(false);
  };

  const handleClear = () => {
    dispatch(clearFilters());
  };

  const [activeIndex1, setActiveIndex1] = useState(0);
  const [activeIndex2, setActiveIndex2] = useState(0);
  const COLORS = ["#FFBB28", "#00C49F", "#FF8042", "#F9A8D4", "#0088FE"];
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="">
          <div className="flex flex-row-reverse">
            <button
              className="m-2 p-2 flex gap-2 items-center border border-gray-400 rounded-md text-gray-600 font-semibold"
              onClick={() => setOpen(!open)}
            >
              <p>Filters</p>
              <FaFilter />
            </button>

            {customFilters && (
              <button
                className="m-2 p-2 flex gap-2 items-center border border-gray-400 rounded-md text-gray-600 font-semibold"
                onClick={handleClear}
              >
                <p>Clear Filters</p>
                <FaXmark />
              </button>
            )}
            {open && (
              <FiltersModal overlayOpen={open} closeOverlay={closeOverlay} />
            )}
          </div>
          <h1 className="p-4 text-white text-center text-2xl bg-sky-950 font-bold">
            MIS Report
          </h1>

          <div className="my-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 text-white">
            <div className="h-40 sm:col-span-2 p-2 bg-sky-900 border rounded-md">
              <h3 className="text-lg">Total Proposals</h3>
              <p className="text-5xl text-center p-4 font-bold">
                {filteredData?.data?.total_proposals}
              </p>
            </div>

            <div className="h-40 sm:col-span-2 p-2 bg-sky-900 border rounded-md">
              <h3 className="text-lg">Total Projects</h3>
              <p className="text-5xl text-center p-4 font-bold">
                {filteredData?.data?.total_projects}
              </p>
            </div>

            <div className="h-40 sm:col-span-2 p-2 bg-sky-900 border rounded-md">
              <h3 className="text-lg">Total Revenue (in INR)</h3>
              <p className="text-5xl text-center p-4 font-bold">
                {filteredData?.data?.total_revenue}
              </p>
            </div>

            {filteredData?.data?.total_proposals > 0 && (
              <>
                <div className="h-70 sm:col-span-3 p-2 bg-sky-900 border rounded-md">
                  <h3 className="text-lg">Proposal Status</h3>
                  <PieChart width={450} height={300}>
                    <Pie
                      dataKey="count"
                      nameKey="status"
                      isAnimationActive={true}
                      data={filteredData?.data?.overall_proposal_status_cnt}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {filteredData?.data?.overall_proposal_status_cnt.map(
                        (entry, index) => (
                          <Cell
                            key={index}
                            fill={ProposalStatusColor[entry.status]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                    <Legend
                      align="right"
                      verticalAlign="middle"
                      layout="vertical"
                      wrapperStyle={{ fontWeight: 500 }}
                    />
                  </PieChart>
                </div>

                <div className="h-70 sm:col-span-3 p-2 bg-sky-900 border rounded-md">
                  <h3 className="text-lg">Project Status</h3>
                  <PieChart width={450} height={300} margin={{ top: 70 }}>
                    <Pie
                      dataKey="count"
                      nameKey="project_status"
                      isAnimationActive={true}
                      data={filteredData?.data?.overall_project_status_cnt}
                      startAngle={180}
                      endAngle={0}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {filteredData?.data?.overall_project_status_cnt.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                      <LabelList
                        dataKey="status"
                        position="outside"
                        offset={20}
                        className="font-thin"
                      />
                    </Pie>
                    <Tooltip />
                    <Legend
                      align="right"
                      verticalAlign="middle"
                      layout="vertical"
                      wrapperStyle={{ fontWeight: 500 }}
                    />
                  </PieChart>
                </div>

                {(customFilters == null ||
                  customFilters?.business_unit?.length == 0) && (
                  <>
                    <div className="h-70 sm:col-span-3 p-2 bg-sky-900 border rounded-md">
                      <h3 className="text-lg">
                        Proposal Division based on Business Unit
                      </h3>
                      <PieChart width={450} height={300} padding={2}>
                        <Pie
                          activeIndex={activeIndex2}
                          activeShape={RenderActiveShape}
                          data={filteredData?.data?.bu_proposal_cnt}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="proposal_count"
                          nameKey="business_unit"
                          onMouseEnter={(event, index) =>
                            setActiveIndex2(index)
                          }
                        >
                          {filteredData?.data?.bu_proposal_cnt.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Legend
                          align="right"
                          verticalAlign="middle"
                          layout="vertical"
                          wrapperStyle={{ fontWeight: 500 }}
                        />
                      </PieChart>
                    </div>

                    <div className="h-70 sm:col-span-3 p-2 bg-sky-900 border rounded-md">
                      <h3 className="text-lg">
                        Project Division based on Business Unit
                      </h3>
                      <PieChart width={450} height={300}>
                        <Pie
                          activeIndex={activeIndex1}
                          activeShape={RenderActiveShape}
                          data={filteredData?.data?.bu_project_cnt}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="project_count"
                          nameKey="business_unit"
                          onMouseEnter={(event, index) =>
                            setActiveIndex1(index)
                          }
                        >
                          {filteredData?.data?.bu_project_cnt.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Legend
                          align="right"
                          verticalAlign="middle"
                          layout="vertical"
                          wrapperStyle={{ fontWeight: 500 }}
                        />
                      </PieChart>
                    </div>
                  </>
                )}

                <div className="h-70 col-span-full px-2 pb-4 bg-sky-900 border rounded-md">
                  <h3 className="text-lg my-2">
                    Conversion Comparison based on Business Unit
                  </h3>
                  <div className="flex justify-between gap-2">
                    <BarChart
                      width={500}
                      height={300}
                      data={filteredData?.data?.comparison}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="business_unit"
                        tick={{ fill: "#e7e5e4" }}
                      />
                      <YAxis
                        tick={{ fill: "#e7e5e4" }}
                        tickLine={{ stroke: "#e7e5e4" }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{ fontWeight: 500 }}
                      />
                      <Bar
                        dataKey="proposal_cnt"
                        fill="#c084fc"
                        data={filteredData?.data?.comparison?.proposal_cnt}
                        activeBar={<Rectangle fill="pink" stroke="blue" />}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="project_cnt"
                        fill="#84cc16"
                        data={filteredData?.data?.comparison?.project_cnt}
                        activeBar={<Rectangle fill="gold" stroke="purple" />}
                        maxBarSize={40}
                      />
                    </BarChart>

                    <table className="table-fixed border mr-4 text-slate-100">
                      <caption class="caption-bottom text-sm m-1">
                        Conversion Analysis Table
                      </caption>
                      <thead>
                        <tr>
                          <th className="px-2 border border-slate-300">BU</th>
                          <th className="px-2 border border-slate-300">
                            Proposals
                          </th>
                          <th className="px-2 border border-slate-300">
                            Projects
                          </th>
                          <th className="px-2 border border-slate-300">
                            Conversion Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData?.data?.comparison.map((bu, index) => (
                          <tr key={index}>
                            <td className="px-2 border border-slate-300 text-center">
                              {bu.business_unit}
                            </td>
                            <td className="px-2 border border-slate-300 text-center">
                              {bu.proposal_cnt}
                            </td>
                            <td className="px-2 border border-slate-300 text-center">
                              {bu.project_cnt}
                            </td>
                            <td className="px-2 border border-slate-300 text-center">
                              {bu.proposal_cnt > 0
                                ? ((bu.project_cnt / bu.proposal_cnt) * 100).toFixed(2)
                                : 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="h-70 col-span-full px-2 pb-4 bg-sky-900 border rounded-md">
                  <h3 className="text-lg my-2">
                    Revenue Comparison based on Business Unit
                  </h3>
                  <div className="flex justify-between gap-2">
                    <BarChart
                      width={600}
                      height={300}
                      margin={{ left: 20 }}
                      data={filteredData?.data?.comparison}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="business_unit"
                        tick={{ fill: "#e7e5e4" }}
                      />
                      <YAxis
                        tick={{ fill: "#e7e5e4" }}
                        tickLine={{ stroke: "#e7e5e4" }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{ fontWeight: 500 }}
                      />
                      <Bar
                        dataKey="bu_revenue"
                        fill="#c084fc"
                        data={filteredData?.data?.comparison?.bu_revenue}
                        activeBar={<Rectangle fill="pink" stroke="blue" />}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="bu_projected_revenue"
                        fill="#84cc16"
                        data={
                          filteredData?.data?.comparison?.bu_projected_revenue
                        }
                        activeBar={<Rectangle fill="gold" stroke="purple" />}
                        maxBarSize={40}
                      />
                    </BarChart>

                    <table className="table-fixed border mr-4 text-slate-100">
                      <caption class="caption-bottom text-sm m-1">
                        Revenue Analysis Table (in INR)
                      </caption>
                      <thead>
                        <tr>
                          <th className="px-2 border border-slate-300">BU</th>
                          <th className="px-2 border border-slate-300">
                            Revenue
                          </th>
                          <th className="px-2 border border-slate-300">
                            Projected Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData?.data?.comparison.map((bu, index) => (
                          <tr key={index}>
                            <td className="px-2 border border-slate-300 text-center">
                              {bu.business_unit}
                            </td>
                            <td className="px-2 border border-slate-300 text-center">
                              {bu.bu_revenue}
                            </td>
                            <td className="px-2 border border-slate-300 text-center">
                              {bu.bu_projected_revenue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="h-70 col-span-full px-2 pb-4 bg-sky-900 border rounded-md">
                  <h3 className="text-lg my-2">Yearly Revenue</h3>
                  <div className="flex justify-between gap-2">
                    <LineChart
                      width={1000}
                      height={300}
                      data={filteredData?.data?.yearly_revenue}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#e7e5e4" }}
                      />
                      <YAxis
                        tick={{ fill: "#e7e5e4" }}
                        tickLine={{ stroke: "#e7e5e4" }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{ fontWeight: 500 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#e879f9"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </div>
                </div>

                <div className="h-70 col-span-3 px-2 pb-4 bg-sky-900 border rounded-md">
                  <h3 className="text-lg my-2">First Quarter Revenue</h3>
                  <div className="flex justify-between gap-2">
                    <LineChart
                      width={500}
                      height={300}
                      data={filteredData?.data?.q1}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#e7e5e4" }}
                      />
                      <YAxis
                        tick={{ fill: "#e7e5e4" }}
                        tickLine={{ stroke: "#e7e5e4" }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{ fontWeight: 500 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#c084fc"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </div>
                </div>

                <div className="h-70 col-span-3 px-2 pb-4 bg-sky-900 border rounded-md">
                  <h3 className="text-lg my-2">Second Quarter Revenue</h3>
                  <div className="flex justify-between gap-2">
                    <LineChart
                      width={500}
                      height={300}
                      data={filteredData?.data?.q2}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#e7e5e4" }}
                      />
                      <YAxis
                        tick={{ fill: "#e7e5e4" }}
                        tickLine={{ stroke: "#e7e5e4" }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{ fontWeight: 500 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#c084fc"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </div>
                </div>

                <div className="h-70 col-span-3 px-2 pb-4 bg-sky-900 border rounded-md">
                  <h3 className="text-lg my-2">Third Quarter Revenue</h3>
                  <div className="flex justify-between gap-2">
                    <LineChart
                      width={500}
                      height={300}
                      data={filteredData?.data?.q3}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#e7e5e4" }}
                      />
                      <YAxis
                        tick={{ fill: "#e7e5e4" }}
                        tickLine={{ stroke: "#e7e5e4" }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{ fontWeight: 500 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#c084fc"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </div>
                </div>

                <div className="h-70 col-span-3 px-2 pb-4 bg-sky-900 border rounded-md">
                  <h3 className="text-lg my-2">Fourth Quarter Revenue</h3>
                  <div className="flex justify-between gap-2">
                    <LineChart
                      width={500}
                      height={300}
                      data={filteredData?.data?.q4}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#e7e5e4" }}
                      />
                      <YAxis
                        tick={{ fill: "#e7e5e4" }}
                        tickLine={{ stroke: "#e7e5e4" }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{ fontWeight: 500 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#c084fc"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboardScreen;
