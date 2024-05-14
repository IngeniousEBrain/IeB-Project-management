import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import Select, { components } from "react-select";
import {
  useDownloadDocumentMutation,
  useDownloadProposalMutation,
  useEditProjectMutation,
  useGetClientsQuery,
  useGetKeyAccountHoldersQuery,
  useGetManagersQuery,
  useGetProjectByIdQuery,
} from "../../slices/projectApiSlice";
import { toast } from "react-toastify";
import Loading from "../Loading";
import { FaDownload, FaEye, FaXmark } from "react-icons/fa6";
import { EyeIcon } from "@heroicons/react/24/outline";

const EditProjectModal = ({ id, overlayOpen, closeOverlay }) => {
  const { data: projectDetails, isLoading: ProjectLoading } =
    useGetProjectByIdQuery(id);

  const [project, setProject] = useState({});
  const [projectFiles, setProjectFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [proposalDocument, setProposalDocument] = useState(null);
  const [selectedClient, setSelectedClient] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedAccountHolder, setSelectedAccountHolder] = useState(null);

  useEffect(() => {
    if (projectDetails) {
      setProject(projectDetails.project);
      setProjectFiles(projectDetails.documents);
      console.log(selectedClient.length);
      if (projectDetails.clients) {
        const transformOptions = projectDetails.clients.map(item => ({
          label: item.email,
          value: item.email
        }))
        setSelectedClient(transformOptions);
      }
      if (projectDetails.project.project_manager?.email) {
        setSelectedManager({
          label: projectDetails.project.project_manager?.email,
          value: projectDetails.project.project_manager?.email,
        });
      }
      if (projectDetails.project.account_manager?.email) {
        setSelectedAccountHolder({
          label: projectDetails.project.account_manager?.email,
          value: projectDetails.project.account_manager?.email,
        });
      }
    }
  }, [projectDetails]);

  console.log(selectedClient);

  const InputRef = useRef(null);
  const handleFileInput = () => {
    InputRef.current.click();
  };

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
    console.log(e.target.value);
  };

  const {
    data: managersData,
    isLoading: ManagerLoading,
    error,
  } = useGetManagersQuery();
  const { data: clientsData, isLoading: ClientLoading } = useGetClientsQuery();

  const {
    data: accountHolders,
    isLoading: KAHLoading,
    error: KAHerror,
  } = useGetKeyAccountHoldersQuery();

  const [editProject, { isLoading: Editing }] = useEditProjectMutation();

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
    setNewFiles([...newFiles, ...fileList]);
  };

  const removeAttachment = (index) => {
    const updatedFileList = [...newFiles];
    updatedFileList.splice(index, 1);
    setNewFiles(updatedFileList);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (let i = 0; i < projectFiles.length; i++) {
        formData.append("documents", newFiles[i]);
      }
      formData.append("project_name", project.project_name);
      formData.append("project_code", project.project_code);
      formData.append("project_description", project.project_description);
      if (proposalDocument != null) {
        formData.append("proposal_upload_file", proposalDocument);
      }
      for (let i = 0; i < selectedClient.length; i++) {
        formData.append("client", selectedClient[i].value);
      }
      formData.append("project_manager", selectedManager.value);
      formData.append("account_manager", selectedAccountHolder.value);
      formData.append("project_cost", project.project_cost);
      formData.append("currency", project.currency);
      formData.append("type_of_service", project.type_of_service);
      formData.append("business_unit", project.business_unit);
      formData.append("status", project.status);
      console.log("form", formData);
      const res = await editProject({ data: formData, id: id }).unwrap();
      if (res.msg) {
        toast.success("Project edited successfully");
        closeOverlay();
      }
    } catch (err) {
      console.log(err.data);
      // if (err.data.project_manager) toast.error(err.data.project_manager[0]);
      // if (err.data.account_manager) toast.error(err.data.account_manager[0]);
      // if (err.data.non_field_errors) toast.error(err.data.non_field_errors[0]);
    }
  };

  const [downloadProposal] = useDownloadProposalMutation();
  const handleProposalDownload = async (downloadId, filename) => {
    console.log(downloadId);
    try {
      const res = await downloadProposal(downloadId);
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

  const [downloadDocument] = useDownloadDocumentMutation();
  const handleDownload = async (downloadId, filename) => {
    console.log(downloadId);
    try {
      const res = await downloadDocument(downloadId);
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

  return (
    <>
      <Transition appear show={true} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setSelectedClient([]);
            closeOverlay();
          }}
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
                  {ProjectLoading ? (
                    <Loading />
                  ) : (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-medium leading-6 text-gray-900 border-b border-gray-900 pb-2"
                      >
                        Edit Project Details
                      </Dialog.Title>

                      <form
                        className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6"
                        onSubmit={submitHandler}
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
                              name="project_name"
                              id="name"
                              value={project.project_name}
                              onChange={handleChange}
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
                              name="project_code"
                              id="code"
                              autoComplete="off"
                              value={project.project_code}
                              onChange={handleChange}
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
                              name="project_description"
                              id="description"
                              autoComplete="off"
                              value={project.project_description}
                              onChange={handleChange}
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
                              className="basic-multi-select"
                              classNamePrefix="select"
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
                              onChange={(option) => setSelectedManager(option)}
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
                              onChange={(option) =>
                                setSelectedAccountHolder(option)
                              }
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
                              name="project_cost"
                              id="cost"
                              autoComplete="off"
                              value={project.project_cost}
                              onChange={handleChange}
                              required
                              className="block w-4/5 rounded-md border-0 py-1.5 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            <div className="">
                              <select
                                id="currency"
                                name="currency"
                                value={project.currency}
                                onChange={handleChange}
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
                              name="type_of_service"
                              id="service"
                              autoComplete="off"
                              value={project.type_of_service}
                              onChange={handleChange}
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
                              name="business_unit"
                              value={project.business_unit}
                              onChange={handleChange}
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
                              value={project.status}
                              onChange={handleChange}
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
                              onChange={(e) =>
                                setProposalDocument(e.target.files[0])
                              }
                              className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>

                          {project.proposal_upload_file && (
                            <div className="mt-2 px-2 py-1 flex justify-between items-center border rounded-sm text-md text-gray-700">
                              <span>
                                {project.proposal_upload_file.replace(
                                  /^.*[\\\/]/,
                                  ""
                                )}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleProposalDownload(
                                      project.project_id,
                                      project.proposal_upload_file.replace(
                                        /^.*[\\\/]/,
                                        ""
                                      )
                                    )
                                  }
                                >
                                  <FaDownload className="h-4 w-4 text-gray-400" />
                                </button>
                                <button type="button">
                                  <FaXmark className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          )}
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
                            {newFiles.length > 0 && (
                              <div className="mt-2 text-md font-medium block p-2 border rounded-md">
                                <h5 className="px-2 mb-4 text-indigo-700">
                                  Newly uploaded files
                                </h5>
                                {newFiles.map((file, index) => (
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
                            {projectFiles.length > 0 && (
                              <div className="mt-2 text-md font-medium block p-2 border rounded-md">
                                <h5 className="px-2 mb-4 text-indigo-700">
                                  Previously uploaded files
                                </h5>
                                {projectFiles.map((file, index) => (
                                  <div
                                    className="m-2 px-2 py-1 flex justify-between items-center border rounded-sm text-md text-gray-700"
                                    key={index}
                                  >
                                    <span>
                                      {file.document.replace(/^.*[\\\/]/, "")}
                                    </span>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDownload(
                                            file.id,
                                            file.document.replace(
                                              /^.*[\\\/]/,
                                              ""
                                            )
                                          )
                                        }
                                      >
                                        <FaDownload className="h-4 w-4 text-gray-400" />
                                      </button>
                                      <button
                                        type="button"
                                        // onClick={() => removeAttachment(index)}
                                      >
                                        <FaXmark className="h-4 w-4 text-gray-500" />
                                      </button>
                                    </div>
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
                            Update Project
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default EditProjectModal;
