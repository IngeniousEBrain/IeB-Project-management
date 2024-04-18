import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FaDownload, FaEye, FaPencil, FaTrash } from "react-icons/fa6";
import {
  useDownloadProposalMutation,
  useGetClientProjectsQuery,
  useStatusUpdateMutation,
} from "../slices/projectApiSlice";
import Loading from "../Components/Loading";
import { toast } from "react-toastify";
import UpdateStatusModal from "../Components/UpdateStatusModal";
import CommentsModal from "../Components/CommentsModal";

const HomeScreen = () => {
  const [id, setId] = useState("");
  const [commentId, setCommentId] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [openStatus, setOpenStatus] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const { data: projects, isLoading, error } = useGetClientProjectsQuery();
  const [download] = useDownloadProposalMutation();
  const rows = projects?.projects;

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

  const handleDownload = async (downloadId, filename) => {
    console.log(downloadId, filename);
    try {
      const res = await download(downloadId);
      console.log(res.data);

      const downloadLink = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = downloadLink;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("File downloaded successfully");
    } catch (err) {
      toast.error(err.error);
    }
  };

  useEffect(() => {}, [projects]);

  const columns = [
    { field: "project_code", headerName: "Code", width: 100 },
    {
      field: "project_name",
      headerName: "Project Name",
      width: 150,
    },
    {
      field: "project_manager",
      headerName: "Manager",
      width: 210,
      renderCell: (params) => {
        return <div>{params.row.project_manager?.email}</div>;
      },
    },
    {
      field: "account_manager",
      headerName: "Key Account Holder",
      width: 210,
      renderCell: (params) => {
        return <div>{params.row.account_manager?.email}</div>;
      },
    },
    {
      field: "type_of_service",
      headerName: "Service",
      width: 110,
      sortable: false,
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
          <div>
            {params.row.proposal_upload_file ? (
              <button
                onClick={() =>
                  handleDownload(params.row.project_id, params.row.project_name)
                }
              >
                <FaDownload className="mx-7 my-3 h-5 w-5 text-indigo-600 hover: text-indigo-500" />
              </button>
            ) : (
              <p className="font-medium">No document</p>
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
  ];

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between border-b-2 border-gray-200 pb-4 pt-6">
          {/* <div className="flex justify-between"> */}
          <h1 className="text-3xl font-bold font-sans tracking-normal text-gray-900 pb-2">
            Dashboard
          </h1>
          <Link to="/create-project">
            <button className="p-2 rounded-md font-medium bg-indigo-600 text-white">
              Request for Proposal
            </button>
          </Link>
          {/* </div> */}
        </div>
        <div className="mt-10">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <div className="mt-10">
            {isLoading ? (
              <Loading />
            ) : rows?.length > 0 ? (
              <DataGrid
                className=""
                disableDensitySelector
                showCellVerticalBorder
                showColumnVerticalBorder
                rows={rows.map((item, index) => ({ id: index + 1, ...item }))}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5,
                    },
                  },
                }}
                // getRowHeight={() => 'auto'}
                autosizeOptions={{
                  columns: ["project_name", "project_manager", "project_code"],
                  includeOutliers: true,
                  includeHeaders: true,
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
              <div className="text-xl font-bold m-auto">No projects</div>
            )}
          </div>
        </div>

        {openStatus ? (
          <UpdateStatusModal
            id={id}
            overlayOpen={openStatusModal}
            closeOverlay={closeStatusModal}
          />
        ) : (
          ""
        )}

        {openComment ? (
          <CommentsModal
            id={commentId}
            overlayOpen={openCommentModal}
            closeOverlay={closeCommentModal}
          />
        ) : (
          ""
        )}
      </main>
    </div>
  );
};

export default HomeScreen;
