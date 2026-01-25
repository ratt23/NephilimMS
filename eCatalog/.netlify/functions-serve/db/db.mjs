
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// ../netlify/functions/db.js
import postgres from "postgres";
var sql = postgres(process.env.NEON_DATABASE_URL, { ssl: "require" });
var db_default = sql;
export {
  db_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbmV0bGlmeS9mdW5jdGlvbnMvZGIuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCBwb3N0Z3JlcyBmcm9tICdwb3N0Z3Jlcyc7XHJcblxyXG4vLyBOZXRsaWZ5IERldiBhdXRvbWF0aWNhbGx5IGxvYWRzIC5lbnYgdmFyaWFibGVzLCBzbyB3ZSBkb24ndCBuZWVkIGRvdGVudiBoZXJlLlxyXG5jb25zdCBzcWwgPSBwb3N0Z3Jlcyhwcm9jZXNzLmVudi5ORU9OX0RBVEFCQVNFX1VSTCwgeyBzc2w6ICdyZXF1aXJlJyB9KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNxbDtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7OztBQUFBLE9BQU8sY0FBYztBQUdyQixJQUFNLE1BQU0sU0FBUyxRQUFRLElBQUksbUJBQW1CLEVBQUUsS0FBSyxVQUFVLENBQUM7QUFFdEUsSUFBTyxhQUFROyIsCiAgIm5hbWVzIjogW10KfQo=
