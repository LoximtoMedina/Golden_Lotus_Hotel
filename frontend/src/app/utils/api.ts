import axios from "axios";

export default class ApiUtils {
  static handleAxiosError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      throw error.response?.data ?? error;
    }

    throw error;
  }
}
