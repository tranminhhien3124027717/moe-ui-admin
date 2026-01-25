
import axios from "axios";
import qs from "qs";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_ADMIN_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    withCredentials: true,

    paramsSerializer: (params) =>
        qs.stringify(params, {
            arrayFormat: "repeat",
            skipNulls: true,
        }),
});


axiosClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý khi Cookie hết hạn (401)
axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Something went wrong";

        console.log({ "status": status, "message": message });


        if (status === 401) {
            // 1. Xóa cờ giả
            localStorage.removeItem("isAdminLoggedIn");

            // 2. Đá về trang login
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axiosClient; 