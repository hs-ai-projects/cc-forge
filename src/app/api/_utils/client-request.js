import Axios, { CanceledError } from "axios";
import { toast } from "@heroui/react";
import { authClient } from "@/auth-client";

const instance = Axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.response.use(
  (res) => {
    if (res.data.code !== 0) {
      toast.danger(res.data.msg);
      return Promise.reject(res.data);
    }
    return res.data.data;
  },
  async (error) => {
    if (error instanceof CanceledError) {
      return Promise.reject(error);
    }
    const { response } = error;
    if (response?.status === 401) {
      authClient.signIn.social({ provider: "feishu" })
    } else {
      toast.danger(response?.data?.msg || "未知错误！");
    }
    return Promise.reject(response?.data);
  }
);

export default instance;
