import axios from './axiosClient.js';

const authService = {
    login(data) {
        return axios.post('/auth/login', data);
    }
};

export default authService;
