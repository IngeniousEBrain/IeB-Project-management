import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FaDownload, FaPencil, FaTrash } from "react-icons/fa6";
import {
  useFileUploadMutation,
  useGetProjectsQuery,
} from "../../slices/projectApiSlice";
import { useNavigate } from "react-router-dom";
import Loading from "../../Components/Loading";
import { toast } from "react-toastify";

const EmployeeHomeScreen = () => {
  const [id, setId] = useState("");
  const [proposal, setProposal] = useState(null);
  const { data: projects, isLoading, error } = useGetProjectsQuery();
  const [fileUpload, { isLoading: FileUploading }] = useFileUploadMutation();

  console.log(projects);
  const rows = projects?.projects;

  const navigate = useNavigate();

  // useEffect(() => {
  // }, [projects]);
  const submitFile = async (e) => {
    e.preventDefault();
    try {
      const file = new FormData();
      file.append('file', proposal);
      console.log("file ", file)
      console.log("proposal ", proposal)
      const res = await fileUpload({ file, id }).unwrap();
      console.log(res);
      if (res.msg) {
        toast.success("File uploaded successfully");
        navigate("/employee")
      }
    } catch (err) {
      toast.error(err.error);
    }
  };

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
      field: "proposal_document",
      headerName: "Proposal Document",
      width: 300,
      renderCell: (params) => {
        return (
          <div>
            {params.row.proposal_upload_file ? (
              <button>
                <FaDownload className="mx-7 my-3 h-5 w-5 text-indigo-600 hover: text-indigo-500" />
              </button>
            ) : (
              <form onSubmit={submitFile} className="flex mt-1.5">
                <input
                  type="file"
                  className="px-1 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  onChange={(e) => {
                    setProposal(e.target.files[0])
                    setId(params.row.project_id);
                  }}
                  required
                />
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 text-white px-2.5 py-1.5 text-sm font-semibold hover:bg-indigo-500"
                >
                  Upload
                </button>
              </form>
            )}
          </div>
        );
      },
    },
  ];
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-5xl">
        <h1 className="text-2xl font-bold">Projects Assigned</h1>
        <div className="mt-10">
          {isLoading ? (
            <Loading />
          ) : rows.length > 0 ? (
            <DataGrid
              className=""
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
                },
              }}
              pageSizeOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          ) : (
            <div className="text-xl font-bold m-auto">
              {" "}
              No assigned projects
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeHomeScreen;
