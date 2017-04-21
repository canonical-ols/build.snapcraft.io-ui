import { Router } from 'express';
import { json } from 'body-parser';

import {
  getAccount,
  signAgreement
} from '../handlers/store';

const router = Router();

router.use('/store/account', json());
router.get('/store/account', getAccount);

router.use('/store/agreement', json());
router.post('/store/agreement', signAgreement);

export default router;
