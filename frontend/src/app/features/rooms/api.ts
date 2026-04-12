import axios from 'axios';
import { environment } from '../../../environments/environment';
import ApiUtils from '../../utils/api';
import type { components } from '../../types/api';

type CreateRequestBody =
  components['requestBodies']['RoomCreateRequest']['content']['application/json'];
type CreateResponseData = components['schemas']['RoomDataResponse'];
type GetRequestBody = components['requestBodies']['RoomGetRequest']['content']['application/json'];
type GetResponseData = components['schemas']['RoomGetResponse'];
type UpdateRequestBody =
  components['requestBodies']['RoomUpdateRequest']['content']['application/json'];
type UpdateResponseData = components['schemas']['RoomDataResponse'];
type DeleteRequestBody =
  components['requestBodies']['RoomDeleteRequest']['content']['application/json'];
type DeleteResponseData = components['schemas']['ResultResponse'];
type RestoreRequestBody =
  components['requestBodies']['RoomRestoreRequest']['content']['application/json'];
type RestoreResponseData = components['schemas']['ResultResponse'];
type ListRequestBody =
  components['requestBodies']['RoomListRequest']['content']['application/json'];
type ListResponseData = components['schemas']['RoomListResponse'];

const axiosClient = axios.create({
  baseURL: environment.apiUrl + 'api/rooms',
  withCredentials: true,
});

export const roomsApi = {
  async create(data: CreateRequestBody): Promise<CreateResponseData> {
    try {
      const response = await axiosClient.post<CreateResponseData>('/create', data);
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async get(data: GetRequestBody): Promise<GetResponseData> {
    try {
      const response = await axiosClient.post<GetResponseData>('/get', data);
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async update(data: UpdateRequestBody): Promise<UpdateResponseData> {
    try {
      const response = await axiosClient.post<UpdateResponseData>('/update', data);
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async delete(data: DeleteRequestBody): Promise<DeleteResponseData> {
    try {
      const response = await axiosClient.post<DeleteResponseData>('/delete', data);
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async restore(data: RestoreRequestBody): Promise<RestoreResponseData> {
    try {
      const response = await axiosClient.post<RestoreResponseData>('/restore', data);
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async list(data: ListRequestBody): Promise<ListResponseData> {
    try {
      const response = await axiosClient.post<ListResponseData>('/list', data);
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },
};

export default roomsApi;
