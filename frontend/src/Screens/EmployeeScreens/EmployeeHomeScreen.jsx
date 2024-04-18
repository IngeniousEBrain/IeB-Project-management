import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FaDownload, FaEye, FaPencil, FaPlus, FaTrash } from "react-icons/fa6";
import {
  useFileUploadMutation,
  useGetProjectsQuery,
} from "../../slices/projectApiSlice";
import { useNavigate } from "react-router-dom";
import Loading from "../../Components/Loading";
import { toast } from "react-toastify";
import CommentsModal from "../../Components/CommentsModal";
import AddProjectModal from "../../Components/AdminComponents/AddProjectModal";
import UpdateStatusModal from "../../Components/UpdateStatusModal";
import { useSelector } from "react-redux";

const EmployeeHomeScreen = () => {
  const [id, setId] = useState("");
  const [open, setOpen] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [edit, setEdit] = useState(false);
  const [commentId, setCommentId] = useState("");
  const [openComment, setOpenComment] = useState(false);
  const [editid, setEditid] = useState("");
  const { data: projects, isLoading, error } = useGetProjectsQuery();
  const [fileUpload, { isLoading: FileUploading }] = useFileUploadMutation();

  const { userInfo } = useSelector((state) => state.auth);
  console.log(projects);
  const rows = projects?.projects;

  const navigate = useNavigate();

  const closeOverlay = () => {
    setOpen(false);
  };

  const openEdit = (id) => {
    console.log(id);
    setEdit(true);
  };

  const closeEdit = () => {
    setEdit(false);
    window.location.reload();
  };

  const openStatusModal = () => {
    setOpenStatus(true);
  };

  const closeStatusModal = () => {
    setOpenStatus(false);
  };

  const openCommentModal = () => {
    setOpenComment(true);
  };

  const closeCommentModal = () => {
    setOpenComment(false);
  };

  const submitFile = async (e) => {
    e.preventDefault();
    try {
      const file = new FormData();
      file.append("file", proposal);
      console.log("file ", file);
      console.log("proposal ", proposal);
      const res = await fileUpload({ file, id }).unwrap();
      console.log(res);
      if (res.msg) {
        toast.success("File uploaded successfully");
        navigate("/employee");
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
      field: "project_description",
      headerName: "Description",
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
      width: 130,
      renderCell: (params) => {
        const rowStatus = params.row.status;
        return (
          <div className="flex justify-between">
            <p
              className={`font-bold mx-2 ${
                rowStatus == "accepted"
                  ? "text-green-600"
                  : rowStatus == "rejected"
                  ? "text-red-600"
                  : rowStatus == "on_hold"
                  ? "text-yellow-600"
                  : "text-indigo-600"
              }`}
            >
              {rowStatus.toUpperCase()}
            </p>
            <button
              onClick={() => {
                openStatusModal();
                setId(params.row.project_id);
              }}
            >
              <FaPencil className="h-5 w-5 text-green-600 hover:text-green-500" />
            </button>
          </div>
        );
      },
    },
    {
      field: "comments",
      headerName: "Comments",
      width: 100,
      renderCell: (params) => {
        const rowStatus = params.row.status;

        return (
          <div className="h-full flex justify-around items-center">
            <button
              onClick={() => {
                openCommentModal();
                setCommentId(params.row.project_id);
              }}
            >
              <FaEye className="h-5 w-5 text-gray-500 hover:text-gray-900" />
            </button>

            {/* <button
              onClick={() => {
                openStatusModal();
                setId(params.row.project_id);
              }}
            >
              <FaPencil className="h-5 w-5 text-green-600 hover:text-green-500" />
            </button> */}
          </div>
        );
      },
    },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   width: 100,
    //   renderCell: (params) => (
    //     <div className="mt-2 flex items-center space-x-2">
    //       <button
    //         className="p-2 rounded-md flex items-center space-x-2"
    //         onClick={() => {
    //           openEdit(params.row.project_id);
    //           setEditid(params.row.project_id);
    //         }}
    //       >
    //         <FaPencil className="text-green-600" />
    //       </button>
    //       {/* <button
    //         className="p-2 rounded-md flex items-center space-x-2"
    //         onClick={() => {
    //           openDelete(params.row._id);
    //           setDeleteid(params.row._id);
    //         }}
    //       >
    //         <FaTrash className="text-red-500" />
    //       </button> */}
    //     </div>
    //   ),
    // },
  ];
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-7xl">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold">Projects Assigned</h1>
            {userInfo.role === "key_account_holder" && (
              <button
                className="p-2 bg-indigo-600 text-white font-medium rounded-md flex items-center space-x-2"
                onClick={() => setOpen(!open)}
              >
                <FaPlus />
                <span>Add Project</span>
              </button>
            )}
            {open && (
              <AddProjectModal overlayOpen={open} closeOverlay={closeOverlay} />
            )}
          </div>
          <div className="mt-10">
            {isLoading ? (
              <Loading />
            ) : rows.length > 0 ? (
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
      {/* {edit ? (
        <ProjectScreen
          id={editid}
          overlayOpen={edit}
          closeOverlay={closeEdit}
        />
      ) : (
        ""
      )} */}

      {openStatus && (
        <UpdateStatusModal
          id={id}
          overlayOpen={openStatusModal}
          closeOverlay={closeStatusModal}
        />
      )}

      {openComment && (
        <CommentsModal
          id={commentId}
          overlayOpen={openCommentModal}
          closeOverlay={closeCommentModal}
        />
      )}
    </>
  );
};

export default EmployeeHomeScreen;
