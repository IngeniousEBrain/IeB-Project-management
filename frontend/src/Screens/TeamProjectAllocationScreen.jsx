import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import Loading from "../Components/Loading";
import {
  useAllocateProjectToTeamMutation,
  useGetClientProjectsQuery,
  useGetClientsQuery,
  useGetProjectByIdQuery,
  useGetTeamQuery,
} from "../slices/projectApiSlice";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";

const TeamProjectAllocationScreen = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedClient, setSelectedClient] = useState([]);
  const { data: clientsData, isLoading: ClientLoading } = useGetTeamQuery();
  const {
    data: projects,
    isLoading: ProjectLoading,
    error,
  } = useGetClientProjectsQuery();
  const { data: projectDetails, isLoading: ProjectIdLoading } =
    useGetProjectByIdQuery(selectedProject?.value ?? skipToken);
  const [allocate, { isLoading }] = useAllocateProjectToTeamMutation();

  const projectOptions = [];
  projects?.projects?.forEach(function (element) {
    projectOptions.push({
      label: element.project_name,
      value: element.project_id,
    });
  });

  const clientOptions = [];
  clientsData?.team?.forEach(function (element) {
    clientOptions.push({ label: element.email, value: element.email });
  });

  useEffect(() => {
    if (projectDetails?.clients) {
      const transformOptions = projectDetails.clients.map((item) => ({
        label: item.email,
        value: item.email,
      }));
      setSelectedClient(transformOptions);
    }
  }, [projectDetails]);

  const Input = (props) => (
    <components.Input
      {...props}
      inputClassName="outline-none border-none shadow-none focus:ring-transparent"
    />
  );
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (let i = 0; i < selectedClient.length; i++) {
        formData.append("client", selectedClient[i].value);
      }
      const res = await allocate({
        data: formData,
        id: selectedProject.value,
      }).unwrap();
      console.log(res);
      if (res.msg) {
        toast.success("Allocation successful!");
      }
    } catch (err) {
      toast.error(err?.data?.errors);
    }
  };

  return (
    <>
      <div className="mt-5 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Allocate Project
          </h2>
        </div>
        {isLoading && <Loading />}
        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" method="POST" onSubmit={submitHandler}>
            <div>
              <div className="col-span-full">
                <label
                  htmlFor="project"
                  className="block text-md font-medium text-gray-700"
                >
                  Project
                </label>
                <div className="mt-2">
                  <Select
                    name="project"
                    options={projectOptions}
                    value={selectedProject}
                    onChange={setSelectedProject}
                    components={{ Input }}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="col-span-full">
                <label
                  htmlFor="client"
                  className="block text-md font-medium text-gray-700"
                >
                  Client
                </label>
                <div className="mt-2">
                  <Select
                    name="client"
                    options={clientOptions}
                    value={selectedClient}
                    isMulti
                    className="basic-multi-select"
                    classNamePrefix="select"
                    closeMenuOnSelect={false}
                    onChange={setSelectedClient}
                    components={{ Input }}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Allocate
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TeamProjectAllocationScreen;
