import Cookies from "js-cookie";
import { PROJECT_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const cashbackApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      validateCoupon: builder.mutation({
        query: (data) => ({
          url: PROJECT_URL + "validate-coupon/",
          method: "POST",
          body: data,
          headers: {
              Authorization: `Bearer ${Cookies.get('access_token')}`,
          },
          formData: true,
        }),
      }),
    }),
});

export const { useValidateCouponMutation } = cashbackApiSlice;