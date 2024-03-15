import { Interceptors } from '@reduxjs/toolkit/query/react'
import { useRefreshAccessTokenQuery } from './usersApiSlice'

export const authMiddleware = Interceptors.injectEndpoints({
    endpoints: (mutationOrQuery) => {
        return (next, action) => {
            if(action.error?.status === 401){
                return next(useRefreshAccessTokenQuery.then((resolved) => ({
                    ...action,
                    meta: {
                        ...action.meta,
                        retry: true,
                        originalArgs: action.payload,
                    }
                })));
            }
            return next(action);
        }
    }
})

export default authMiddleware;