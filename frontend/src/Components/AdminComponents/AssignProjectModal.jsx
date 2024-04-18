import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Select, { components } from "react-select";
import {
  useAssignProjectToAuthoritiesMutation,
  useGetKeyAccountHoldersQuery,
  useGetManagersQuery,
  useGetProjectByIdQuery,
} from "../../slices/projectApiSlice";
import { toast } from "react-toastify";
import Loading from "../Loading";

const AssignProjectModal = ({ id, overlayOpen, closeOverlay }) => {

  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedAccountHolder, setSelectedAccountHolder] = useState(null);


  const {data: projectDetails, isLoading: ProjectLoading} = useGetProjectByIdQuery(id);

  const { data: managersData, isLoading, error } = useGetManagersQuery();

  const {
    data: accountHolders,
    isLoading: KAHLoading,
    error: KAHerror,
  } = useGetKeyAccountHoldersQuery();

  const [assign, { isLoading: Assigning }] = useAssignProjectToAuthoritiesMutation(id);

  const project = projectDetails?.project;

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

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await assign({
        project_manager: selectedManager.value,
        account_manager: selectedAccountHolder.value,
        id: id,
      }).unwrap();
      toast.success("Project assigned successfully");
      closeOverlay();
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
          className="relative z-10"
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 border-b border-gray-900 pb-2"
                  >
                    Project Details
                  </Dialog.Title>

                  { ProjectLoading ? <Loading /> : 
                  <form
                    className="mt-4 flex flex-col gap-4"
                    onSubmit={submitHandler}
                  >
                    <div className="my-2 space-x-2">
                      <span className="text-md font-medium text-gray-500">
                        Project Name:
                      </span>
                      <span className="text-md text-gray-500">{project.project_name}</span>
                    </div>
                    <div className="my-2">
                      <p className="text-md font-medium text-gray-500">
                        Project Description:
                      </p>
                      <p className="text-md text-gray-500">{project.project_description}</p>
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="country"
                        className="block text-md font-medium text-gray-500"
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
                        htmlFor="country"
                        className="block text-md font-medium text-gray-500"
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

                    <div className="mt-4">
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Assign Project
                      </button>
                    </div>
                  </form>
                  }
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AssignProjectModal;
