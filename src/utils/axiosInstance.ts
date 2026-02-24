import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getCookieValue, removeCookieValues } from './cookies';

export const authInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const instance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  headers: {
    'Content-Type': 'application/json',
  },
});

const requestHandler = async (
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>> => {
  const accessToken = await getCookieValue('accessToken');
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
};

const onRequestError = async (error: AxiosError): Promise<AxiosError> => {
  console.error(`[request error] [${JSON.stringify(error)}]`);
  return await Promise.reject(error);
};

const responseHandler = (response: any): any => {
  return response;
};

const onResponseError = async (error: AxiosError): Promise<AxiosError> => {
  console.error(`[response error] [${JSON.stringify(error)}]`);
  if (error.response?.status === 401) {
    removeCookieValues();
    window.location.href = '/';
  }
  return Promise.reject(error.response);
};

instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const updatedConfig = await requestHandler(config);
    return updatedConfig;
  },
  onRequestError,
);

instance.interceptors.response.use(responseHandler, onResponseError);
