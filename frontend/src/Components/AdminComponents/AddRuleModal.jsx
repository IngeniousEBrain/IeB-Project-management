import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import {
  useGetClientRevenueQuery,
  useSetRuleMutation,
} from "../../slices/projectApiSlice";
import { toast } from "react-toastify";

const AddRuleModal = ({ id, overlayOpen, closeOverlay }) => {
  const [yearlyAmount, setYearlyAmount] = useState(null);
  const [currency, setCurrency] = useState("");
  const [quarterlyAmount, setQuarterlyAmount] = useState(null);
  const [yearlyDiscount, setYearlyDiscount] = useState(0);
  const [quarterlyDiscount, setQuarterlyDiscount] = useState(0);

  const { data, isLoading } = useGetClientRevenueQuery(id);
  const [rule, { isLoading: Loading }] = useSetRuleMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await rule({
        data: {
          yearly_amount: yearlyAmount,
          quarterly_amount: quarterlyAmount,
          yearly_discount: yearlyDiscount,
          quarterly_discount: quarterlyDiscount,
          cashback_currency: currency,
        },
        id: id,
      });
      if (res.data.msg) {
        toast.success("Rule set successfully!");
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

          <div className="fixed inset-0 overflow-auto">
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
                <Dialog.Panel className="overflow-auto w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 border-b border-gray-900 pb-2"
                  >
                    Add Discount Rule
                  </Dialog.Title>
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <p className="font-semibold">
                        Yearly Revenue (till date):
                      </p>
                      <p className="">{data?.data?.yearly_revenue} INR</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="font-semibold">First Quarter Revenue:</p>
                      <p className="">{data?.data?.q1} INR</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="font-semibold">Second Quarter Revenue:</p>
                      <p className="">{data?.data?.q2} INR</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="font-semibold">Third Quarter Revenue:</p>
                      <p className="">{data?.data?.q3} INR</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="font-semibold">Fourth Quarter Revenue:</p>
                      <p className="">{data?.data?.q4} INR</p>
                    </div>
                  </div>
                  <form
                    className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6"
                    onSubmit={submitHandler}
                  >
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="yearly_amount"
                        className="block text-md font-medium text-gray-700"
                      >
                        Yearly Amount
                      </label>
                      <div className="relative mt-2 flex gap-2 rounded-md shadow-sm">
                        <input
                          type="text"
                          name="yearly_amount"
                          id="yearly_amount"
                          autoComplete="off"
                          onChange={(e) => setYearlyAmount(e.target.value)}
                          className="block w-4/5 rounded-md border-0 py-1.5 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <div className="">
                          <select
                            id="currency"
                            name="currency"
                            onChange={(e) => setCurrency(e.target.value)}
                            value={currency}
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
                        htmlFor="yearly_amount"
                        className="block text-md font-medium text-gray-700"
                      >
                        Yearly Discount
                      </label>
                      <div className="relative mt-2 flex gap-2 rounded-md shadow-sm">
                        <select
                          id="currency"
                          name="currency"
                          onChange={(e) => setYearlyDiscount(e.target.value)}
                          className="w-full block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="" selected>
                            Select
                          </option>
                          <option value="5">5%</option>
                          <option value="10">10%</option>
                          <option value="15">15%</option>
                          <option value="20">20%</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="yearly_amount"
                        className="block text-md font-medium text-gray-700"
                      >
                        Quarterly Amount
                      </label>
                      <div className="relative mt-2 flex gap-2 rounded-md shadow-sm">
                        <input
                          type="text"
                          name="quarterly_amount"
                          id="quarterly_amount"
                          autoComplete="off"
                          onChange={(e) => setQuarterlyAmount(e.target.value)}
                          className="block w-4/5 rounded-md border-0 py-1.5 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <div className="">
                          <select
                            id="currency"
                            name="currency"
                            onChange={(e) => setCurrency(e.target.value)}
                            value={currency}
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
                        htmlFor="yearly_amount"
                        className="block text-md font-medium text-gray-700"
                      >
                        Quarterly Discount
                      </label>
                      <div className="relative mt-2 flex gap-2 rounded-md shadow-sm">
                        <select
                          id="currency"
                          name="currency"
                          onChange={(e) => setQuarterlyDiscount(e.target.value)}
                          className="w-full block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="" selected>
                            Select
                          </option>
                          <option value="5">5%</option>
                          <option value="10">10%</option>
                          <option value="15">15%</option>
                          <option value="20">20%</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 col-span-full">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Apply Rule
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

export default AddRuleModal;
