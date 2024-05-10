import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import { FaImage } from "react-icons/fa6";
import { useAddOrganizationMutation } from "../../slices/usersApiSlice";
import { toast } from "react-toastify";

const AddOrgModal = ({ overlayOpen, closeOverlay }) => {
  const [logo, setLogo] = useState(null);
  const [name, setName] = useState("");

  const [addOrganization, { isLoading: Adding }] = useAddOrganizationMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("org_name", name);
      if (logo != null) {
        formData.append("org_logo", logo);
      }
      const res = await addOrganization(formData);
      if (res.data.msg) {
        toast.success("Organization added successfully");
        closeOverlay();
      }
    } catch (err) {
      console.log(err);
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
                    Add Organization Details
                  </Dialog.Title>

                  <form
                    className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6"
                    onSubmit={submitHandler}
                    type="multipart/form-data"
                  >

                    <div className="col-span-full">
                      <label
                        htmlFor="photo"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Organization Logo
                      </label>
                      <div className="mt-2 flex items-center gap-x-3">
                        <FaImage
                          className="h-12 w-12 text-gray-300"
                          aria-hidden="true"
                        />
                        <input
                          type="file"
                          onChange={(e) => setLogo(e.target.files[0])}
                          id="profile-pic"
                          accept=".jpg, .png, .jpeg"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label
                        htmlFor="name"
                        className="block text-md font-medium text-gray-700"
                      >
                        Organization Name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          autoComplete="off"
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="mt-4 col-span-full">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Add Organization
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

export default AddOrgModal;
