import axios from 'axios';
import { environment } from '../../../environments/environment';
import ApiUtils from '../../utils/api';
import type { components } from '../../types/api';

type LoginRequestBody = components['requestBodies']['LoginRequest']['content']['application/json'];
type LoginResponseData = components['schemas']['LoginResponse'];
type FetchResponseData = components['schemas']['FetchAuthResponse'];
type LogoutResponseData = components['schemas']['LogoutResponse'];

const axiosClient = axios.create({
  baseURL: environment.apiUrl + 'api/auth',
  withCredentials: true,
});

export const authApi = {
  async login(data: LoginRequestBody): Promise<LoginResponseData> {
    try {
      const response = await axiosClient.post<LoginResponseData>('/login', data);
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async fetch(): Promise<FetchResponseData> {
    try {
      const response = await axiosClient.post<FetchResponseData>('/fetch');
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async logout(): Promise<LogoutResponseData> {
    try {
      const response = await axiosClient.post<LogoutResponseData>('/logout');
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },
};

export default authApi;
