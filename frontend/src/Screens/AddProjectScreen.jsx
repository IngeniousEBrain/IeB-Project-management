import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAddProjectMutation } from "../slices/projectApiSlice";
import Loading from "../Components/Loading";

const AddProjectScreen = () => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [cost, setCost] = useState("");
  const [service, setService] = useState("");

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [addProject, { isLoading }] = useAddProjectMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await addProject({
        project_name: projectName,
        project_description: projectDescription,
        project_cost: cost,
        type_of_service: service,
      }).unwrap();
      toast.success(res.msg);
      navigate("/");
    } catch (err) {
      console.log(err);
      if (err.data.project_name) toast.error(err.data.project_name[0]);
      if (err.data.project_description)
        toast.error(err.data.project_description[0]);
      if (err.data.non_field_errors) toast.error(err.data.non_field_errors[0]);
    }
  };
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-5xl">
        <form onSubmit={submitHandler} autoComplete="off">
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
              Enter Project Details
            </h2>

            <div className="border-b border-gray-900/10 pb-12">
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label
                    htmlFor="street-address"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Project Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="street-address"
                      id="street-address"
                      autoComplete="street-address"
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="street-address"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Project Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      type="text"
                      name="street-address"
                      id="street-address"
                      autoComplete="street-address"
                      onChange={(e) => setProjectDescription(e.target.value)}
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 sm:col-start-1">
                  <label
                    htmlFor="cost"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Cost
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <input
                      type="text"
                      name="cost"
                      id="cost"
                      autoComplete="off"
                      onChange={(e) => setCost(e.target.value)}
                      required
                      className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center mx-2 text-gray-500">
                      {userInfo.currency.toUpperCase()}
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
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end">
            {isLoading && <Loading />}
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
