import { serve } from "@novu/echo/dist/next";

import { echo } from "../../echo/novu-workflow";

export const { GET, POST, PUT } = serve({ client: echo });
