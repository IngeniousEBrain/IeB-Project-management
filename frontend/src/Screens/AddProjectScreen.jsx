import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAddProjectMutation } from "../slices/projectApiSlice";
import Loading from "../Components/Loading";
import { useValidateCouponMutation } from "../slices/cashbackApiSlice";
import { updateCredentials } from "../slices/authSlice";

const AddProjectScreen = () => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [cost, setCost] = useState("");
  const [currency, setCurrency] = useState("");
  const [service, setService] = useState("");
  const [coupon, setCoupon] = useState("");

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [addProject, { isLoading }] = useAddProjectMutation();
  const [validateCoupon, { isLoading: Validating }] =
    useValidateCouponMutation();

  const submitCoupon = async (e) => {
    e.preventDefault();
    if (coupon === "") {
      toast.error("Apply coupon code");
    } else {
      try {
        const formData = new FormData();
        formData.append("coupon", coupon);
        console.log("form", formData);
        const res = await validateCoupon(formData);
        console.log(res);
        if (res?.data?.msg) {
          toast.success(res.data.msg);
        } else {
          toast.error(res.error.data.error);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("project_name", projectName);
      formData.append("project_description", projectDescription);
      formData.append("project_cost", cost);
      formData.append("currency", currency);
      formData.append("type_of_service", service);
      formData.append("coupon", coupon)
      console.log("form", formData);
      const res = await addProject(formData);
      console.log(res)
      if (res.data?.msg) {
        toast.success(res.data?.msg);
        if (coupon !== ""){
          if (coupon[0] === 'Y'){
            dispatch(updateCredentials({ yearly_discount: "0", yearly_amount: null  }));
          }
          else if (coupon[1] === 'Q'){
            dispatch(updateCredentials({ quarterly_discount: "0", quarterly_amount: null  }));
          }
        }
      }
    } catch (err) {
      console.log(err);
      if (err.data.project_name) toast.error(err.data.project_name[0]);
      if (err.data.project_description)
        toast.error(err.data.project_description[0]);
      if (err.data.non_field_errors) toast.error(err.data.non_field_errors[0]);
    }
  };
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center p-3 lg:p-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-5xl">
        <form
          onSubmit={submitHandler}
          autoComplete="off"
          type="multipart/form-data"
        >
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
              Enter Project Details
            </h2>

            <div className="border-b border-gray-900/10 pb-12">
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-gray-900"
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

                <div className="col-span-full">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Project Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      type="text"
                      name="description"
                      id="description"
                      autoComplete="off"
                      onChange={(e) => setProjectDescription(e.target.value)}
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                    className="block text-sm font-medium leading-6 text-gray-900"
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
                  {userInfo.sub_role === "Head" && (
                    <div className="flex flex-col gap-2">
                      <p className="block text-sm font-medium leading-6 text-indigo-600">
                        Have Coupon Code?
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="coupon"
                          id="coupon"
                          autoComplete="off"
                          placeholder="Apply Coupon Code"
                          onChange={(e) => setCoupon(e.target.value)}
                          required
                          className="block w-4/5 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <button
                          type="button"
                          className="w-1/5 flex justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          onClick={submitCoupon}
                        >
                          {Validating && (
                            <svg
                              aria-hidden="true"
                              role="status"
                              className="inline w-4 h-4 me-3 text-white animate-spin"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="#E5E7EB"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentColor"
                              />
                            </svg>
                          )}
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="my-3 flex items-center justify-between">
            {isLoading && <Loading />}
            <button
              type="submit"
              disabled={Validating ? true : false}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectScreen;
