import Cookies from "js-cookie";
import { USERS_AUTH_URL } from "../constants";
import { getRefreshToken } from "../utils";
import { apiSlice } from "./apiSlice";

const refresh_token = getRefreshToken();

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => ({
        url: USERS_AUTH_URL + "register/",
        method: "POST",
        body: data,
      }),
      keepUnusedDataFor: 5,
    }),
    adminRegistrations: builder.mutation({
      query: (data) => ({
        url: USERS_AUTH_URL + "admin-registrations/",
        method: "POST",
        body: data,
      }),
      keepUnusedDataFor: 5,
    }),
    login: builder.mutation({
      query: (data) => ({
        url: USERS_AUTH_URL + "login/",
        method: "POST",
        body: data,
      }),
      keepUnusedDataFor: 5,
    }),
    refreshAccessToken: builder.query({
      query: () => ({
        url: USERS_AUTH_URL + "token/refresh/",
        method: "POST",
        body: { refresh_token },
        headers: {
          Authorization: `Bearer ${refresh_token}`,
        },
      }),
    }),
    changePassword: builder.mutation({
      query: ({password, confirm_password , access_token}) => ({
        url: USERS_AUTH_URL + "changepassword/",
        method: "POST",
        body: {password, confirm_password},
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }),
    }),
    sendCredentialEmail: builder.mutation({
      query: (data) => ({
        url: USERS_AUTH_URL + "send-credentials-mail/",
        method: "POST",
        body: data,
      }),
    }),
    sendEmail: builder.mutation({
      query: (data) => ({
        url: USERS_AUTH_URL + "send-reset-password-mail/",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({password, confirm_password, id, token}) => ({
        url: USERS_AUTH_URL + "reset-password/" + id + "/" + token + "/",
        method: "POST",
        body: {password, confirm_password},
      }),
    }),
    logout: builder.mutation({
      query: ({refresh, access_token}) => ({
        url: USERS_AUTH_URL + "logout/",
        method: "POST",
        body: {refresh},
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }),
    }),
  }),
});

export const { useRegisterMutation, useAdminRegistrationsMutation, useLoginMutation, useRefreshAccessTokenQuery, useChangePasswordMutation, useSendCredentialEmailMutation, useSendEmailMutation, useResetPasswordMutation, useLogoutMutation } = usersApiSlice;