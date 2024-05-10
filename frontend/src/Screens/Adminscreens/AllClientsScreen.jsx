import { useState, useEffect } from "react";
import { useGetClientsQuery } from "../../slices/projectApiSlice";
import Loading from "../../Components/Loading";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FaPencil } from "react-icons/fa6";
import AddRuleModal from "../../Components/AdminComponents/AddRuleModal";

const AllClientsScreen = () => {
  const [edit, setEdit] = useState(false);
  const [editid, setEditid] = useState("");

  const openEdit = (id) => {
    setEdit(true);
  };

  const closeEdit = () => {
    setEdit(false);
  };

  const { data: clients, isLoading, error } = useGetClientsQuery();

  const rows = clients?.clients;

  useEffect(() => {}, [clients]);

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
              setEditid(params.row.email);
            }}
          >
            <FaPencil className="h-5 w-5 text-green-600" />
          </button>
        </div>
      ),
    },
    {
      field: "client_code",
      headerName: "Client Code",
      width: 110,
    },
    {
      field: "organization",
      headerName: "Organization",
      width: 150,
      renderCell: (params) => {
        return <p>{params.row.organization.org_name}</p>;
      },
    },
    {
      field: "sub_role",
      headerName: "Role",
      width: 100,
    },
    { field: "email", headerName: "Email", width: 150 },
    {
      field: "ph_number",
      headerName: "Phone Number",
      width: 150,
    },
    {
      field: "yearly_amount",
      headerName: "Yearly Amount",
      width: 150,
    },
    {
      field: "yearly_discount",
      headerName: "Yearly Discount",
      width: 150,
    },
    {
      field: "quarterly_amount",
      headerName: "Quarterly Amount",
      width: 150,
    },
    {
      field: "quarterly_discount",
      headerName: "Quarterly Discount",
      width: 150,
    },
    {
      field: "cashback_currency",
      headerName: "Cashback Currency",
      width: 150,
    },
    {
      field: "currency",
      headerName: "Currency",
      width: 110,
    },
    {
      field: "geographical_region",
      headerName: "Geographical Region",
      width: 150,
    },
    {
      field: "address",
      headerName: "Address",
      width: 250,
    },
  ];

  return (
    <>
      <div className="flex justify-between px-6 py-4">
        <h1 className="text-2xl font-bold">Clients</h1>
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
          <div className="text-xl font-bold m-auto"> No Clients</div>
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

export default AllClientsScreen;
