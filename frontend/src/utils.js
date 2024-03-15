import Cookies from "js-cookie";

export const getToken = () => {
    return Cookies.get('access_token');
}

export const getRefreshToken = () => {
    return Cookies.get('refresh_token');
}