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
  const [currency, setCurrency] = useState("");
  const [service, setService] = useState("");

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [addProject, { isLoading }] = useAddProjectMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("project_name", projectName);
      formData.append("project_description", projectDescription);
      formData.append("project_cost", cost);
      formData.append("currency", currency);
      formData.append("type_of_service", service);
      console.log("form", formData);
      const res = await addProject(formData);
      if(res.msg){
        toast.success(res.msg);
        navigate("/client");
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
    <div className="flex min-h-full flex-1 flex-col justify-center p-6 lg:p-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-5xl">
        <form onSubmit={submitHandler} autoComplete="off" type="multipart/form-data">
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
              </div>
            </div>
          </div>

          <div className="my-6 flex items-center justify-end">
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
