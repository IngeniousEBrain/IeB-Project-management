import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL, USERS_AUTH_URL } from "../constants";
import { logout, setAccessToken } from "./authSlice";
import { getRefreshToken } from "../utils";
import Cookies from "js-cookie";

const refresh_token = getRefreshToken();

const baseQuery = fetchBaseQuery({ baseUrl: BASE_URL })
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  console.log(refresh_token)
  const refresh = Cookies.get('refresh_token')
  console.log("refresh ", refresh)
  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult = await baseQuery({
      url: USERS_AUTH_URL + 'token/refresh/',
      method: 'POST',
      body: { refresh },
      headers: {
        Authorization: `Bearer ${Cookies.get('refresh_token')}`,
      },
    }, api, extraOptions)
    if (refreshResult.data) {
      api.dispatch(setAccessToken(refreshResult.data))
      const authHeader = `Bearer ${refreshResult.data.access}`
      args.headers.Authorization = authHeader
      // retry the initial query
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }
  return result
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  credentials: "include",
  tagTypes: ["User"],
  endpoints: (builder) => ({}),
});
