import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";

const InvoiceModal = ({ id, overlayOpen, closeOverlay }) => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [invoiceDocument, setInvoiceDocument] = useState([]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("invoice_number", invoiceNumber);
      if(invoiceDocument != null) {
        formData.append("invoice_file", invoiceDocument);
      }
      formData.append("amount", amount);
      formData.append("currency", currency);
      console.log("form", formData);
      // const res = await addProject(formData);
      // if (res.msg) {
        toast.success("Project assigned successfully");
        closeOverlay();
      // }
    } catch (err) {
      console.log(err);
      // if (err.data.project_manager) toast.error(err.data.project_manager[0]);
      // if (err.data.account_manager) toast.error(err.data.account_manager[0]);
      // if (err.data.non_field_errors) toast.error(err.data.non_field_errors[0]);
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
                    Add Invoice Details
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
                        Invoice Number
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          autoComplete="off"
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="cost"
                        className="block text-md font-medium text-gray-700"
                      >
                        Amount
                      </label>
                      <div className="relative mt-2 flex gap-2 rounded-md shadow-sm">
                        <input
                          type="text"
                          name="cost"
                          id="cost"
                          autoComplete="off"
                          onChange={(e) => setAmount(e.target.value)}
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

                    <div className="col-span-full">
                      <p className="block text-md font-medium text-gray-700">
                        Upload Invoice Document
                      </p>
                      <div className="mt-2">
                        <input
                          type="file"
                          name="proposal"
                          id="proposal"
                          onChange={(e) => setInvoiceDocument(e.target.files)}
                          className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="mt-4 col-span-full">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Add Invoice
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

export default InvoiceModal;
