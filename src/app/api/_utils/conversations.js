import request from "./client-request";

export function createConversation(data) {
  return request.post("/api/conversations", data ?? {});
}

export function deleteConversation(id) {
  return request.delete(`/api/conversations/${id}`);
}
