import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import {
  useStatusUpdateMutation,
} from "../slices/projectApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// import { useRefetchQueries } from '@reduxjs/toolkit';

const UpdateStatusModal = ({ id, overlayOpen, closeOverlay }) => {
  const [status, setStatus] = useState("pending");
  const [statusUpdate, isLoading] = useStatusUpdateMutation();

  const navigate = useNavigate();
  // const refetchQueries = useRefetchQueries();

  const submitStatus = async (e) => {
    e.preventDefault();
    console.log(id, status);
    try {
      const res = await statusUpdate({ status: status, id }).unwrap();
      console.log(res);
      if (res.msg) {
        toast.success("Status updated successfully");
        closeOverlay();
      }
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
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 border-b border-gray-900 pb-2"
                  >
                    Update Project Status
                  </Dialog.Title>

                  <form
                    className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6"
                    onSubmit={submitStatus}
                  >

                    <div className="col-span-full">
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

                    <div className="mt-4 col-span-full">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        // onClick={() => closeOverlay()}
                      >
                        Update Status
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

export default UpdateStatusModal;
