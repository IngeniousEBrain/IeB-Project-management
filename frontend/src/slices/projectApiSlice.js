import Cookies from "js-cookie";
import { PROJECT_URL } from "../constants";
import { getRefreshToken } from "../utils";
import { apiSlice } from "./apiSlice";

const refresh_token = getRefreshToken();

export const projectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addProject: builder.mutation({
      query: (data) => ({
        url: PROJECT_URL + "project-creation/",
        method: "POST",
        body: data,
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
    }),
    unassignedProjects: builder.query({
      query: () => ({
        url: PROJECT_URL + "unassigned-projects/",
        method: "GET",
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
    }),
    getProjectById: builder.query({
      query: (id) => ({
        url: PROJECT_URL + "find-project/" + id + "/",
        method: "GET",
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
    }),
    getManagers: builder.query({
      query: () => ({
        url: PROJECT_URL + "allmanagers/",
        method: "GET",
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
    }),
    getKeyAccountHolders: builder.query({
      query: () => ({
        url: PROJECT_URL + "allkahs/",
        method: "GET",
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
    }),
    assignProjectToAuthorities: builder.mutation({
      query: ({project_manager, account_manager, id}) => ({
        url: PROJECT_URL + "assign-project/" + id + "/",
        method: "POST",
        body: {project_manager, account_manager},
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
    }),
    getProjects: builder.query({
      query: () => ({
        url: PROJECT_URL + "display-assigned-projects/",
        method: "GET",
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
    }),
    fileUpload: builder.mutation({
      query: ({ file, id }) => ({
        url: PROJECT_URL + "file-upload/" + id + "/",
        method: "PUT",
        body:  file,
        headers: {
           'Authorization': `Bearer ${Cookies.get('access_token')}`,
        },
        formData :true,
      }),
    }),
  }),
});

export const { useAddProjectMutation, useUnassignedProjectsQuery, useGetProjectByIdQuery, useGetManagersQuery, useGetKeyAccountHoldersQuery, useAssignProjectToAuthoritiesMutation, useGetProjectsQuery, useFileUploadMutation } = projectApiSlice;