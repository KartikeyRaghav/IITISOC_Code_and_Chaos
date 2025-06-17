import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const createProject = asyncHandler(async (req, res) => {
    const {name, branch, folder} = req.body;
});
