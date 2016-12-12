import { Router } from 'express';
import { json } from 'body-parser';

import { newIntegration } from '../handlers/github';

const router = Router();

router.use('/github/integrations', json());
router.post('/github/integrations', newIntegration);

export default router;
