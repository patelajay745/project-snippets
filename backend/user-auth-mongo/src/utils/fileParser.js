import formidable, { File } from "formidable";

export const fileParser = async (req, res, next) => {
  const form = formidable();
  // console.log(form);
  const [fields, files] = await form.parse(req);

  // console.log("fields: ", fields);
  // console.log("files: ", files); // your files will look like this ..... files:{ avatar:[],profilePicture:[]}

  if (!req.body) req.body = {};

  for (let key in fields) {
    req.body[key] = fields[key][0];
  }

  if (!req.files) req.files = {};

  for (let key in files) {
    const actualFiles = files[key];

    if (!actualFiles) break;

    if (actualFiles.length > 1) {
      req.files[key] = actualFiles;
    } else {
      req.files[key] = actualFiles[0];
    }
  }

  console.log("ajay", req.files.image["newFilename"]);

  next();
};
