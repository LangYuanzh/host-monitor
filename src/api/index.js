import request from '../utils/request';
import axios from 'axios';
export const tableInit = query => {
    return request({
        url: '/api/table-init',
        method: 'get',
        params: query
    });
};

export const hostSearch = query => {
    return request({
        url: '/api/host-search',
        method: 'get',
        params: query,
        data: query
    });
};

export const hostUpdate = query => {
    return axios.post('/api/update',query);
};

export const hostInsert = query => {
    return axios.post('/api/host-insert',query);
};

export const resourceSearch = query => {
    return axios.post('/api/resource-search',query);
};

export const hostDelete = query => {
    return request({
        url: '/api/delete',
        method: 'get',
        params: query
    });
};


export const loginRequest = query => {
    return request({
        url: '/api/login',
        method: 'get',
        params: query
    });
};
