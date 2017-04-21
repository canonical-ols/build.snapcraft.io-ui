import { Router } from 'express';
import { json } from 'body-parser';

import {
  signAgreement
} from '../handlers/store';

const router = Router();

router.use('/store/agreement', json());
router.post('/store/agreement', signAgreement);

export default router;
