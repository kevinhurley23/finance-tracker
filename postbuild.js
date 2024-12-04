import fs from "fs-extra";
import path from "path";
const srcDir = path.resolve("dist");
const destDir = "C:\\xampp\\htdocs\\finance-tracker";
fs.remove(destDir)
  .then(() => fs.copy(srcDir, destDir))
  .then(() => console.log("dist folder copied to C:\\xampp\\htdocs"))
  .catch((err) => console.error(err));
