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
        formData :true,
      }),
    }),
    editProject: builder.mutation({
      query: ({data, id}) => ({
        url: PROJECT_URL + "edit-project/" + id + "/",
        method: "PUT",
        body: data,
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
        formData :true,
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
    allProjects: builder.query({
      query: () => ({
        url: PROJECT_URL + "all-projects/",
        method: "GET",
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
      cache: "no-cache",
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
    getClients: builder.query({
      query: () => ({
        url: PROJECT_URL + "allclients/",
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
      cache: "no-cache",
    }),
    getClientProjects: builder.query({
      query: () => ({
        url: PROJECT_URL + "display-client-projects/",
        method: "GET",
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
      cache: "no-cache",
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
    statusUpdate: builder.mutation({
      query: ({ status, id }) => ({
        url: PROJECT_URL + "update-status/" + id + "/",
        method: "PUT",
        body:  {status},
        headers: {
           'Authorization': `Bearer ${Cookies.get('access_token')}`,
        },
      }),
    }),
    downloadProposal: builder.mutation({
      query: (id) => ({
        url: PROJECT_URL + "download-proposal-file/" + id + "/",
        method: "GET",
        headers: {
          'Authorization': `Bearer ${Cookies.get('access_token')}`,
        },
        responseHandler: async (response) => await response.blob(),
        cache: "no-cache",
      })
    }),
    downloadDocument: builder.mutation({
      query: (id) => ({
        url: PROJECT_URL + "download-document/" + id + "/",
        method: "GET",
        headers: {
          'Authorization': `Bearer ${Cookies.get('access_token')}`,
        },
        responseHandler: async (response) => await response.blob(),
        cache: "no-cache",
      })
    }),
    addComment: builder.mutation({
      query: ({ data, id }) => ({
        url: PROJECT_URL + id + "/add-comment/",
        method: "POST",
        body: data,
        headers: {
          'Authorization': `Bearer ${Cookies.get('access_token')}`,
        },
        formData: true,
      }),
      invalidatesTags: ['Comments'],
    }),
    getCommentsByProjectId: builder.query({
      query: (id) => ({
        url: PROJECT_URL + id + "/allcomments/",
        method: "GET",
        headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
      providesTags: ['Comments']
    }),
  }),
});

export const { useAddProjectMutation, useEditProjectMutation, useAllProjectsQuery, useUnassignedProjectsQuery, useGetProjectByIdQuery, useGetClientsQuery, useGetManagersQuery, useGetKeyAccountHoldersQuery, useAssignProjectToAuthoritiesMutation, useGetProjectsQuery, useGetClientProjectsQuery, useFileUploadMutation, useStatusUpdateMutation, useDownloadProposalMutation, useDownloadDocumentMutation, useAddCommentMutation, useGetCommentsByProjectIdQuery } = projectApiSlice;