import path from "path";
import dotenv from "dotenv";

export default () => {
  // Whenever jest is run, make use of the env file associated with the current NODE_ENV
  dotenv.config({ path: path.resolve(__dirname, `.env.${process.env.NODE_ENV || "offline"}`) });
};
