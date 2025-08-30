const { Router } = require("express");
const { TrackProcess, All } = require("../controllers/TrackProcess.controller");

const route = Router();

route.get("/track-process",TrackProcess);
route.get("/all", All)



module.exports = route