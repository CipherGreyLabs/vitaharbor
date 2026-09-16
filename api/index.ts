import app from "../src/worker/index";

export const config = {
  runtime: "edge"
};

export default app.fetch;

