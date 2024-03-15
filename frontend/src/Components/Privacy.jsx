import React, { useState } from "react";
import { useChangePasswordMutation } from "../slices/usersApiSlice";
import { getToken } from "../utils";
import { toast } from "react-toastify";

const Privacy = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 

  const [changePassword, {isLoading}] = useChangePasswordMutation();
  
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await changePassword( {password: password, confirm_password: confirmPassword}).unwrap();
      toast.success("Password changed successfully");
    } catch (err) {
      console.log("error");
      console.log(err)
      if(err.data.non_field_errors) toast.error(err.data.non_field_errors[0]);
      else toast.error(err.data.detail);
    }
  };

  return (
    <>
      <div className="sm:w-full sm:max-w-sm">
        <div className="sm:w-full sm:max-w-sm">
          <h2 className="text-xl font-medium leading-8 tracking-tight text-gray-600">
            Change password
          </h2>
        </div>
        <form className="space-y-4 pt-2" method="POST" onSubmit={submitHandler}>
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                New Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="off"
                required
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Confirm New Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="confirm_password"
                name="password"
                type="password"
                autoComplete="off"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-1/4 justify-center rounded-md bg-green-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Privacy;
