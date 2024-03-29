import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAdminRegistrationsMutation, useSendCredentialEmailMutation } from "../../slices/usersApiSlice";
import Loading from "../../Components/Loading";
import { EyeIcon } from "@heroicons/react/24/outline";

const AdminRegisterScreen = () => {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [check, setCheck] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [adminRegistrations, { isLoading }] = useAdminRegistrationsMutation();
  const [sendCredentials, {isLoading: sending}] = useSendCredentialEmailMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await adminRegistrations({ role: role, email: email, password: password }).unwrap();
      console.log(res);
      if (res.user) {
        toast.success("Registration successful!")
        const sendMail = await sendCredentials({ email: email, password: password})
        // toast.success()
      }
    } catch (err) {
      toast.error(err.data.errors);
    }
  };

  const generatePassword = () => {
    const pass = Math.random().toString(36).slice(-8);
    setPassword(pass);
  };

  const viewPassword = () => {
    setCheck(!check);
  };
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Register Authorities
          </h2>
        </div>
        {isLoading && <Loading />}
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" method="POST" onSubmit={submitHandler}>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Role
              </label>
              <div className="mt-2">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="" selected disabled>
                    Select Role
                  </option>
                  <option value="project_manager">Project Manager</option>
                  <option value="key_account_holder">Key Account Holder</option>
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="new-email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="text-sm">
                  <button
                    onClick={generatePassword}
                    className="font-semibold text-white bg-indigo-600 px-2 py-1.5 rounded-md hover:bg-indigo-500"
                  >
                    Generate Password
                  </button>
                </div>
              </div>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input
                  id="password"
                  name="password"
                  type={check ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <EyeIcon
                    className="h-6 w-6 text-gray-500 mx-2"
                    onClick={viewPassword}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Register 
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminRegisterScreen;
