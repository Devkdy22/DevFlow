// declare namespace Express {
//   export interface Request {
//     user: { _id: ObjectId; email: string; name: string };
//   }
// }

import { Types } from "mongoose";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string; // 🔥 JWT에서 내려주는 값
//       };
//     }
//   }
// }
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string; // JWT payload.id 와 100% 일치
    };
  }
}

export {};
