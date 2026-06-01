import { NextResponse } from "next/server";

export class ResponseUtil {
  static ok(data = null, status = 200) {
    return NextResponse.json({ code: 0, msg: "", data }, { status });
  }

  static created(data) {
    return ResponseUtil.ok(data, 201);
  }

  static error(msg = "请求失败", status = 400) {
    return NextResponse.json({ code: 1, msg, data: null }, { status });
  }

  static unauthorized(msg = "Unauthorized") {
    return ResponseUtil.error(msg, 401);
  }

  static notFound(msg = "Not found") {
    return ResponseUtil.error(msg, 404);
  }
}
