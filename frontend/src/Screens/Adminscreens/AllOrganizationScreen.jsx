import { useState, useEffect } from "react";
import { useGetClientsQuery, useGetOrganizationsQuery } from "../../slices/projectApiSlice";
import Loading from "../../Components/Loading";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FaPencil, FaPlus } from "react-icons/fa6";
import AddRuleModal from "../../Components/AdminComponents/AddRuleModal";
import AddOrgModal from "../../Components/AdminComponents/AddOrgModal";

const AllOrganizationScreen = () => {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editid, setEditid] = useState("");

  const closeOverlay = () => {
    setOpen(false);
  };

  const openEdit = (id) => {
    setEdit(true);
  };

  const closeEdit = () => {
    setEdit(false);
  };

  const { data: orgs, isLoading, error } = useGetOrganizationsQuery();

  const rows = orgs?.orgs;

  useEffect(() => {}, [orgs]);

  const columns = [
    {
      field: "actions",
      headerName: "",
      width: 50,
      renderCell: (params) => (
        <div className="mt-2 flex items-center space-x-2">
          <button
            className="p-2 rounded-md flex items-center space-x-2"
            onClick={() => {
              openEdit();
              setEditid(params.row.org_name);
            }}
          >
            <FaPencil className="h-5 w-5 text-green-600" />
          </button>
        </div>
      ),
    },
    // {
    //   field: "org_logo",
    //   headerName: "Logo",
    //   width: 110,
    //   renderCell: (params) => (
    //     <img
    //       src={params.row.org_logo}
    //       alt="Logo"
    //       className="w-30 h-30 rounded-md m-2"
    //     />
    //   ),
    // },
    { field: "org_name", headerName: "Name", width: 150 },
  ];

  return (
    <>
      <div className="flex justify-between px-6 py-4">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <button
          className="p-2 bg-indigo-600 text-white font-medium rounded-md flex items-center space-x-2"
          onClick={() => setOpen(!open)}
        >
          <FaPlus />
          <span>Add Organization</span>
        </button>
        {open && (
          <AddOrgModal overlayOpen={open} closeOverlay={closeOverlay} />
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
                csvOptions: { disableToolbarButton: true },
              },
            }}
            pageSizeOptions={[50]}
            disableRowSelectionOnClick
          />
        ) : (
          <div className="text-xl font-bold m-auto"> No Organizations</div>
        )}
      </div>
      {edit ? (
        <AddRuleModal id={editid} overlayOpen={edit} closeOverlay={closeEdit} />
      ) : (
        ""
      )}
    </>
  );
};

export default AllOrganizationScreen;
