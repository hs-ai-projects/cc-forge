import { describe, it, expect } from "vitest";
import { ResponseUtil } from "../response";

async function json(res) {
  return res.json();
}

describe("ResponseUtil.ok", () => {
  it("returns code 0 with data", async () => {
    expect(await json(ResponseUtil.ok({ x: 1 }))).toEqual({ code: 0, msg: "", data: { x: 1 } });
  });

  it("defaults data to null", async () => {
    expect(await json(ResponseUtil.ok())).toEqual({ code: 0, msg: "", data: null });
  });

  it("defaults status to 200", () => {
    expect(ResponseUtil.ok().status).toBe(200);
  });

  it("accepts custom status", () => {
    expect(ResponseUtil.ok({ a: 1 }, 201).status).toBe(201);
  });
});

describe("ResponseUtil.created", () => {
  it("returns code 0 with status 201", async () => {
    const res = ResponseUtil.created({ id: "1" });
    expect(res.status).toBe(201);
    expect(await json(res)).toEqual({ code: 0, msg: "", data: { id: "1" } });
  });
});

describe("ResponseUtil.error", () => {
  it("returns code 1 with msg", async () => {
    expect(await json(ResponseUtil.error("bad"))).toEqual({ code: 1, msg: "bad", data: null });
  });

  it("defaults status to 400", () => {
    expect(ResponseUtil.error("bad").status).toBe(400);
  });

  it("accepts custom status", () => {
    expect(ResponseUtil.error("not found", 404).status).toBe(404);
  });
});

describe("ResponseUtil.unauthorized", () => {
  it("returns code 1 with status 401", async () => {
    const res = ResponseUtil.unauthorized();
    expect(res.status).toBe(401);
    expect((await json(res)).code).toBe(1);
  });

  it("accepts custom msg", async () => {
    expect((await json(ResponseUtil.unauthorized("请先登录"))).msg).toBe("请先登录");
  });
});

describe("ResponseUtil.notFound", () => {
  it("returns code 1 with status 404", async () => {
    const res = ResponseUtil.notFound();
    expect(res.status).toBe(404);
    expect((await json(res)).code).toBe(1);
  });

  it("accepts custom msg", async () => {
    expect((await json(ResponseUtil.notFound("conversation not found"))).msg).toBe("conversation not found");
  });
});
