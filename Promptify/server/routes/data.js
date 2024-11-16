// data.js file imports all routers to allow for easier import in server.js

import defaultRoutes from "./defaultRoutes.js";

import userRoutes from "./userRoutes.js";
import challengeRoutes from "./challengeRoutes.js";
import submissionRoutes from "./submissionRoutes.js";
import commentRoutes from "./commentRoutes.js";
import upvoteRoutes from "./upvoteRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import userFollowersRoutes from "./userFollowersRoutes.js";

export { 
    defaultRoutes, 
    userRoutes, 
    challengeRoutes, 
    submissionRoutes, 
    commentRoutes, 
    upvoteRoutes, 
    notificationRoutes, 
    userFollowersRoutes 
};