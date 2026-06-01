import Axios, { CanceledError } from "axios";
import { toast } from "@heroui/react";
import { signIn } from "next-auth/react";

const instance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
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
      signIn("feishu")
    } else {
      toast.danger(response?.data?.msg || "未知错误！");
    }
    return Promise.reject(response?.data);
  }
);

export default instance;
