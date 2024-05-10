import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import Select, { components } from "react-select";
import {
  useAddProjectMutation,
  useGetClientsQuery,
  useGetKeyAccountHoldersQuery,
  useGetManagersQuery,
} from "../../slices/projectApiSlice";
import { toast } from "react-toastify";
import { FaXmark } from "react-icons/fa6";

const AddProjectModal = ({ overlayOpen, closeOverlay }) => {
  const [projectCode, setProjectCode] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [cost, setCost] = useState("");
  const [currency, setCurrency] = useState("");
  const [service, setService] = useState("");
  const [status, setStatus] = useState("pending");
  const [proposalDocument, setProposalDocument] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedAccountHolder, setSelectedAccountHolder] = useState(null);

  console.log(selectedClient)

  const InputRef = useRef(null);
  const handleFileInput = () => {
    InputRef.current.click();
  };

  const { data: managersData, isLoading, error } = useGetManagersQuery();
  const { data: clientsData, isLoading: ClientLoading } = useGetClientsQuery();

  const {
    data: accountHolders,
    isLoading: KAHLoading,
    error: KAHerror,
  } = useGetKeyAccountHoldersQuery();

  const clientOptions = [];
  clientsData?.clients?.forEach(function (element) {
    clientOptions.push({ label: element.email, value: element.email });
  });

  const managerOptions = [];
  managersData?.managers?.forEach(function (element) {
    managerOptions.push({ label: element.email, value: element.email });
  });

  const kahOptions = [];
  accountHolders?.kahs?.forEach(function (element) {
    kahOptions.push({ label: element.email, value: element.email });
  });

  const Input = (props) => (
    <components.Input
      {...props}
      inputClassName="outline-none border-none shadow-none focus:ring-transparent"
    />
  );

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    setProjectFiles([...projectFiles, ...fileList]);
  };

  const removeAttachment = (index) => {
    const updatedFileList = [...projectFiles];
    updatedFileList.splice(index, 1);
    setProjectFiles(updatedFileList);
  };

  console.log(projectFiles);

  const [addProject, { isLoading: Adding }] = useAddProjectMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (let i = 0; i < projectFiles.length; i++) {
        formData.append("documents", projectFiles[i]);
      }
      formData.append("project_name", projectName);
      formData.append("project_code", projectCode);
      formData.append("project_description", projectDescription);
      if(proposalDocument != null) {
        formData.append("proposal_upload_file", proposalDocument);
      }
      for (let i = 0; i < selectedClient.length; i++) {
        formData.append("client", selectedClient[i].value);
      }
      formData.append("project_manager", selectedManager.value);
      formData.append("account_manager", selectedAccountHolder.value);
      formData.append("project_cost", cost);
      formData.append("currency", currency);
      formData.append("type_of_service", service);
      formData.append("business_unit", businessUnit);
      formData.append("status", status);
      console.log("form", formData);
      const res = await addProject(formData);
      if (res.data.msg) {
        toast.success("Project assigned successfully");
        closeOverlay();
      }
    } catch (err) {
      console.log(err);
      if (err.data.project_manager) toast.error(err.data.project_manager[0]);
      if (err.data.account_manager) toast.error(err.data.account_manager[0]);
      if (err.data.non_field_errors) toast.error(err.data.non_field_errors[0]);
    }
  };

  return (
    <>
      <Transition appear show={true} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => closeOverlay()}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 border-b border-gray-900 pb-2"
                  >
                    Add Project Details
                  </Dialog.Title>

                  <form
                    className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6"
                    onSubmit={submitHandler}
                    type="multipart/form-data"
                  >
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="name"
                        className="block text-md font-medium text-gray-700"
                      >
                        Project Name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          autoComplete="off"
                          onChange={(e) => setProjectName(e.target.value)}
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="code"
                        className="block text-md font-medium text-gray-700"
                      >
                        Project Code
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="code"
                          id="code"
                          autoComplete="off"
                          onChange={(e) => setProjectCode(e.target.value)}
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label
                        htmlFor="description"
                        className="block text-md font-medium text-gray-700"
                      >
                        Project Description
                      </label>
                      <div className="mt-2">
                        <textarea
                          type="text"
                          name="description"
                          id="description"
                          autoComplete="off"
                          onChange={(e) =>
                            setProjectDescription(e.target.value)
                          }
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label
                        htmlFor="client"
                        className="block text-md font-medium text-gray-700"
                      >
                        Client
                      </label>
                      <div className="mt-2">
                        <Select
                          name="client"
                          options={clientOptions}
                          value={selectedClient}
                          isMulti
                          closeMenuOnSelect={false}
                          onChange={setSelectedClient}
                          components={{ Input }}
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="manager"
                        className="block text-md font-medium text-gray-700"
                      >
                        Assign Manager
                      </label>
                      <div className="mt-2">
                        <Select
                          name="Manager"
                          options={managerOptions}
                          value={selectedManager}
                          onChange={setSelectedManager}
                          components={{ Input }}
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="account-holder"
                        className="block text-md font-medium text-gray-700"
                      >
                        Assign Key Account Holder
                      </label>
                      <div className="mt-2">
                        <Select
                          name="AccountHolder"
                          options={kahOptions}
                          value={selectedAccountHolder}
                          onChange={setSelectedAccountHolder}
                          components={{ Input }}
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3 sm:col-start-1">
                      <label
                        htmlFor="cost"
                        className="block text-md font-medium text-gray-700"
                      >
                        Cost
                      </label>
                      <div className="relative mt-2 flex gap-2 rounded-md shadow-sm">
                        <input
                          type="text"
                          name="cost"
                          id="cost"
                          autoComplete="off"
                          onChange={(e) => setCost(e.target.value)}
                          required
                          className="block w-4/5 rounded-md border-0 py-1.5 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <div className="">
                          <select
                            id="currency"
                            name="currency"
                            onChange={(e) => setCurrency(e.target.value)}
                            required
                            className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          >
                            <option value="" selected>
                              Select
                            </option>
                            <option value="usd">USD</option>
                            <option value="euro">EURO</option>
                            <option value="inr">INR</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="service"
                        className="block text-md font-medium text-gray-700"
                      >
                        Service Type
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="service"
                          id="service"
                          autoComplete="off"
                          onChange={(e) => setService(e.target.value)}
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="business-unit"
                        className="block text-md font-medium text-gray-700"
                      >
                        Business Unit
                      </label>
                      <div className="mt-2">
                        <select
                          id="business-unit"
                          name="business-unit"
                          onChange={(e) => setBusinessUnit(e.target.value)}
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="" selected disabled>
                            Select Business Unit
                          </option>
                          <option value="HBI">
                            Healthcare Business Intelligence (BI)
                          </option>
                          <option value="HTI">
                            Healthcare Technical Intelligence (TI)
                          </option>
                          <option value="HIP">
                            Healthcare Intellectual Property (IP)
                          </option>
                          <option value="HIPI">
                            Hitech Intellectual Property (IP)
                          </option>
                          <option value="CFH">
                            Chemical Food and Hitech (CFH)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="status"
                        className="block text-md font-medium text-gray-700"
                      >
                        Status
                      </label>
                      <div className="mt-2">
                        <select
                          id="status"
                          name="status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="pending" selected>
                            PENDING
                          </option>
                          <option value="accepted">ACCEPTED</option>
                          <option value="rejected">REJECTED</option>
                          <option value="on_hold">ON HOLD</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-span-full">
                      <p className="block text-md font-medium text-gray-700">
                        Upload Proposal Document
                      </p>
                      <div className="mt-2">
                        <input
                          type="file"
                          name="proposal"
                          id="proposal"
                          onChange={(e) => setProposalDocument(e.target.files[0])}
                          className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <p className="block text-md font-medium text-gray-700">
                        Upload Other Technical Documents
                      </p>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={handleFileInput}
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Choose File
                        </button>
                        <input
                          type="file"
                          name="files"
                          id="files"
                          multiple
                          ref={InputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {projectFiles.length > 0 && (
                          <div className="mt-2 text-md font-medium block p-2 border rounded-md">
                            {projectFiles.map((file, index) => (
                              <div
                                className="m-2 px-2 py-1 flex justify-between items-center border rounded-sm text-md text-gray-700"
                                key={index}
                              >
                                <span>{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(index)}
                                >
                                  <FaXmark className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 col-span-full">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        // onClick={() => closeOverlay()}
                      >
                        Add Project
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AddProjectModal;
