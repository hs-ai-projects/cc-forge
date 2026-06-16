import request from "./client-request";

export function createConversation(data) {
  return request.post("/conversations", data ?? {});
}

export function deleteConversation(id) {
  return request.delete(`/conversations/${id}`);
}
