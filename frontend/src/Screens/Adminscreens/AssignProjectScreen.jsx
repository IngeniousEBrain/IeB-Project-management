import { useState, useEffect } from "react";
import { useUnassignedProjectsQuery } from "../../slices/projectApiSlice";
import Loading from "../../Components/Loading";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FaPencil, FaTrash } from "react-icons/fa6";
import ProjectScreen from "./ProjectScreen";

const AssignProjectScreen = () => {
  const [edit, setEdit] = useState(false);
  const [editid, setEditid] = useState("");

  const openEdit = (id) => {
    console.log(id);
    setEdit(true);
  };

  const closeEdit = () => {
    setEdit(false);
    window.location.reload();
  };

  const { data: projects, isLoading, error } = useUnassignedProjectsQuery();


  const rows = projects?.projects;

  useEffect(() => {}, [projects]);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
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
      <div>
        {isLoading ? (
          <Loading />
        ) : ( rows?.length > 0 ?
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
            checkboxSelection
            disableRowSelectionOnClick
          /> : <div className="text-xl font-bold m-auto"> No unassigned projects</div>
        )}
      </div>
      {edit ? (
        <ProjectScreen id={editid} overlayOpen={edit} closeOverlay={closeEdit} />
      ) : (
        ""
      )}
      
    </>
  );
};

export default AssignProjectScreen;
