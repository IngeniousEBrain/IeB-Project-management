import { useState, useEffect } from "react";
import { useAllProjectsQuery, useDownloadProposalMutation } from "../../slices/projectApiSlice";
import Loading from "../../Components/Loading";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  FaCircleCheck,
  FaCircleMinus,
  FaCircleXmark,
  FaDownload,
  FaPencil,
  FaPlus,
  FaSpinner,
  FaTrash,
} from "react-icons/fa6";
import EditProjectModal from "../../Components/AdminComponents/EditProjectModal";
import AddProjectModal from "../../Components/AdminComponents/AddProjectModal";
import ProjectStatusModal from "../../Components/ProjectStatusModal";
import InvoiceModal from "../../Components/AdminComponents/InvoiceModal";
import { toast } from "react-toastify";

const AllProjectsScreen = () => {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editid, setEditid] = useState("");
  const [openProjectStatus, setOpenProjectStatus] = useState(false);
  const [projectStatusId, setProjectStatusId] = useState("");
  const [openInvoice, setOpenInvoice] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");

  const closeOverlay = () => {
    setOpen(false);
  };

  const openEdit = (id) => {
    setEdit(true);
  };

  const closeEdit = () => {
    setEdit(false);
  };

  const openProjectStatusModal = (id) => {
    setOpenProjectStatus(true);
  };

  const closeProjectStatusModal = () => {
    setOpenProjectStatus(false);
  };

  const openInvoiceModal = (id) => {
    setOpenInvoice(true);
  };

  const closeInvoiceModal = () => {
    setOpenInvoice(false);
  };

  const [download] = useDownloadProposalMutation();
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

  const { data: projects, isLoading, error } = useAllProjectsQuery();

  const rows = projects?.projects;

  useEffect(() => {}, [projects]);

  const columns = [
    // { field: "id", headerName: "ID", width: 50 },
    {
      field: "actions",
      headerName: "",
      width: 50,
      renderCell: (params) => (
        <div className="mt-2 flex items-center space-x-2">
          <button
            className="p-2 rounded-md flex items-center space-x-2"
            onClick={() => {
              openEdit(params.row.project_id);
              setEditid(params.row.project_id);
            }}
          >
            <FaPencil className="h-5 w-5 text-green-600" />
          </button>
        </div>
      ),
    },
    { field: "project_code", headerName: "Project Code", width: 100 },
    {
      field: "project_name",
      headerName: "Project Name",
      width: 150,
    },
    // {
    //   field: "client",
    //   headerName: "Client",
    //   width: 110,
    //   valueFormatter: (value) => `${value.first_name} ${value.last_name}`,
    //   renderCell: (params) => {
    //     return (
    //       <div>
    //         {params.row.client.first_name} {params.row.client.last_name}
    //       </div>
    //     );
    //   },
    // },
    {
      field: "type_of_service",
      headerName: "Service Type",
      width: 110,
    },
    {
      field: "project_cost",
      headerName: "Cost",
      width: 150,
      renderCell: (params) => {
        return (
          <p>
            {params.row.project_cost} {params.row.currency.toUpperCase()}
          </p>
        );
      },
    },
    {
      field: "proposal_document",
      headerName: "Proposal Document",
      width: 150,
      renderCell: (params) => {
        return (
          <div className="flex items-center justify-center h-full">
            {params.row.proposal_upload_file ? (
              <button
                onClick={() =>
                  handleDownload(params.row.project_id, params.row.project_name)
                }
              >
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
      headerName: "Proposal Status",
      width: 120,
      renderCell: (params) => {
        const rowStatus = params.row.status;
        return (
          <div>
            <p
              className={`font-bold mx-2 ${
                rowStatus === "accepted"
                  ? "text-green-600"
                  : rowStatus === "rejected"
                  ? "text-red-600"
                  : rowStatus === "on_hold"
                  ? "text-yellow-600"
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
      field: "project_status",
      headerName: "Project Status",
      width: 120,
      renderCell: (params) => {
        const projectStatus = params.row.project_status;
        const proposalStatus = params.row.status;
        return (
          <div className="m-3 flex justify-between">
            {projectStatus === "not_applicable" ? (
              <FaCircleMinus className="h-5 w-5 text-yellow-600" />
            ) : projectStatus === "WIP" ? (
              <FaSpinner className="h-5 w-5 text-indigo-600" />
            ) : (
              <FaCircleCheck className="h-5 w-5 text-green-600" />
            )}

            {proposalStatus == "accepted" && (
              <button
                onClick={() => {
                  openProjectStatusModal();
                  setProjectStatusId(params.row.project_id);
                }}
              >
                <FaPencil className="h-5 w-5 text-green-600" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      field: "billing_details",
      headerName: "Billing",
      width: 110,
      renderCell: (params) => {
        const billing = params.row.billing_details;
        const proposalStatus = params.row.status;
        return (
          <div className="m-3 flex justify-between">
            {billing === "invoiced" ? (
              <FaCircleCheck className="h-5 w-5 text-green-600" />
            ) : (
              <FaCircleXmark className="h-5 w-5 text-red-600" />
            )}

            {proposalStatus == "accepted" && (
              <button
                onClick={() => {
                  openInvoiceModal();
                  setInvoiceId(params.row.project_id);
                }}
              >
                <FaPencil className="h-5 w-5 text-green-600" />
              </button>
            )}
          </div>
        );
      },
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
      <div className="mb-4">
        {isLoading ? (
          <Loading />
        ) : rows?.length > 0 ? (
          <DataGrid
            className=""
            disableDensitySelector
            rows={rows.map((item, index) => ({ id: index + 1, ...item }))}
            columns={columns}
            style={{
              whiteSpace: "wrap",
              overflow: "hidden",
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 50,
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
                csvOptions: {fileName: "projects.csv"},
                excelExportOptions: { fileName : "projects.xlsx"},
              },
            }}
            pageSizeOptions={[50]}
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

      {openProjectStatus ? (
        <ProjectStatusModal
          id={projectStatusId}
          overlayOpen={openProjectStatus}
          closeOverlay={closeProjectStatusModal}
        />
      ) : (
        ""
      )}

      {openInvoice && (
        <InvoiceModal
          id={invoiceId}
          overlayOpen={openInvoice}
          closeOverlay={closeInvoiceModal}
        />
      )}
    </>
  );
};

export default AllProjectsScreen;
