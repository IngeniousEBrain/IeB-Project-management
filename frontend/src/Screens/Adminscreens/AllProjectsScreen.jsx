import { useState, useEffect } from "react";
import { useAllProjectsQuery } from "../../slices/projectApiSlice";
import Loading from "../../Components/Loading";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FaDownload, FaPencil, FaPlus, FaTrash } from "react-icons/fa6";
import ProjectScreen from "./ProjectScreen";
import EditProjectModal from "../../Components/AdminComponents/EditProjectModal";
import AddProjectModal from "../../Components/AdminComponents/AddProjectModal";

const AllProjectsScreen = () => {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editid, setEditid] = useState("");

  const closeOverlay = () => {
    setOpen(false);
  };

  const openEdit = (id) => {
    console.log(id);
    setEdit(true);
  };

  const closeEdit = () => {
    setEdit(false);
    // window.location.reload();
  };

  const { data: projects, isLoading, error } = useAllProjectsQuery();

  const rows = projects?.projects;

  useEffect(() => {}, [projects]);

  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    { field: "project_code", headerName: "Project Code", width: 100 },
    {
      field: "project_name",
      headerName: "Project Name",
      width: 150,
    },
    {
      field: "client",
      headerName: "Client",
      width: 110,
      renderCell: (params) => {
        return (
          <div>
            {params.row.client.first_name} {params.row.client.last_name}
          </div>
        );
      },
    },
    {
      field: "type_of_service",
      headerName: "Service Type",
      width: 110,
    },
    {
      field: "project_cost",
      headerName: "Cost",
      width: 100,
    },
    {
      field: "proposal_document",
      headerName: "Proposal Document",
      width: 150,
      renderCell: (params) => {
        return (
          <div className="flex items-center justify-center h-full">
            {params.row.proposal_upload_file ? (
              <button className="">
                <FaDownload className="text-center h-5 w-5 text-indigo-600 hover: text-indigo-500" />
              </button>
            ) : (
              <div className="text-center"> No document </div>
            )}
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => {
        const rowStatus = params.row.status;
        return (
          <div>
              <p
                className={`font-bold mx-2 ${
                  rowStatus == "accepted"
                    ? "text-green-600"
                    : rowStatus == "rejected"
                    ? "text-red-600"
                    : rowStatus == "on_hold"?
                    "text-yellow-600"
                    : "text-indigo-600"
                }`}
              >
                {rowStatus.toUpperCase()}
              </p>
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <div className="mt-2 flex items-center space-x-2">
          <button
            className="p-2 rounded-md flex items-center space-x-2"
            onClick={() => {
              openEdit(params.row.project_id);
              setEditid(params.row.project_id);
            }}
          >
            <FaPencil className="text-green-600" />
          </button>
          {/* <button
            className="p-2 rounded-md flex items-center space-x-2"
            onClick={() => {
              openDelete(params.row._id);
              setDeleteid(params.row._id);
            }}
          >
            <FaTrash className="text-red-500" />
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between px-6 py-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          className="p-2 bg-indigo-600 text-white font-medium rounded-md flex items-center space-x-2"
          onClick={() => setOpen(!open)}
        >
          <FaPlus />
          <span>Add Project</span>
        </button>
        {open ? (
          <AddProjectModal overlayOpen={open} closeOverlay={closeOverlay} />
        ) : (
          ""
        )}
      </div>
      <div>
        {isLoading ? (
          <Loading />
        ) : rows?.length > 0 ? (
          <DataGrid
            className=""
            disableDensitySelector
            rows={rows.map((item, index) => ({ id: index + 1, ...item }))}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: {
                  debounceMs: 500,
                },
                printOptions: { disableToolbarButton: true },
                csvOptions: { disableToolbarButton: true },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
          />
        ) : (
          <div className="text-xl font-bold m-auto"> No projects</div>
        )}
      </div>
      {edit ? (
        <EditProjectModal
          id={editid}
          overlayOpen={edit}
          closeOverlay={closeEdit}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default AllProjectsScreen;
