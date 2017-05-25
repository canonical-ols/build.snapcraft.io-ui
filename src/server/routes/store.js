import { Router } from 'express';
import { json } from 'body-parser';

import {
  getSnapDetails
} from '../handlers/store';

const router = Router();

router.use('/github/user', json());
router.get('/snaps/details/:name', getSnapDetails);

export default router;
