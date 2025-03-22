import swaggerAutogen from "swagger-autogen";
import { BASEURL } from "./config/index.js";

const doc = {
  info: {
    title: "User Auth Backend(Prisma)",
    description: "Description",
  },
  host: BASEURL,
};

const outputFile = "./swagger-output.json";
const routes = ["./index.js"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
