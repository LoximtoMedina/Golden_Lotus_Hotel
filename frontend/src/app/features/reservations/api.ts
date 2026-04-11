import axios from "axios";
import { environment } from "../../../environments/environment";
import ApiUtils from "../../utils/api";
import type { components } from "../../types/api";

type CreateRequestBody =
  components["requestBodies"]["ReservationCreateRequest"]["content"]["application/json"];
type CreateResponseData = components["schemas"]["ReservationDataResponse"];
type GetRequestBody =
  components["requestBodies"]["ReservationGetRequest"]["content"]["application/json"];
type GetResponseData = components["schemas"]["ReservationGetResponse"];
type UpdateRequestBody =
  components["requestBodies"]["ReservationUpdateRequest"]["content"]["application/json"];
type UpdateResponseData = components["schemas"]["ReservationDataResponse"];
type DeleteRequestBody =
  components["requestBodies"]["ReservationDeleteRequest"]["content"]["application/json"];
type DeleteResponseData = components["schemas"]["ResultResponse"];
type RestoreRequestBody =
  components["requestBodies"]["ReservationRestoreRequest"]["content"]["application/json"];
type RestoreResponseData = components["schemas"]["ResultResponse"];
type ListRequestBody =
  components["requestBodies"]["ReservationListRequest"]["content"]["application/json"];
type ListResponseData = components["schemas"]["ReservationListResponse"];

const axiosClient = axios.create({
  baseURL: environment.apiUrl + "api/reservations",
  withCredentials: true,
});

export const reservationsApi = {
  async create(
    data: CreateRequestBody,
  ): Promise<CreateResponseData> {
    try {
      const response = await axiosClient.post<CreateResponseData>(
        "/create",
        data,
      );
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async get(
    data: GetRequestBody,
  ): Promise<GetResponseData> {
    try {
      const response = await axiosClient.post<GetResponseData>("/get", data);
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async update(
    data: UpdateRequestBody,
  ): Promise<UpdateResponseData> {
    try {
      const response = await axiosClient.post<UpdateResponseData>(
        "/update",
        data,
      );
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async delete(
    data: DeleteRequestBody,
  ): Promise<DeleteResponseData> {
    try {
      const response = await axiosClient.post<DeleteResponseData>(
        "/delete",
        data,
      );
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async restore(
    data: RestoreRequestBody,
  ): Promise<RestoreResponseData> {
    try {
      const response = await axiosClient.post<RestoreResponseData>(
        "/restore",
        data,
      );
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },

  async list(
    data: ListRequestBody,
  ): Promise<ListResponseData> {
    try {
      const response = await axiosClient.post<ListResponseData>("/list", data);
      return response.data;
    } catch (error) {
      return ApiUtils.handleAxiosError(error);
    }
  },
};

export default reservationsApi;
