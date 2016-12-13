import { Router } from 'express';
import { json } from 'body-parser';

import { newSnap, findSnap } from '../handlers/launchpad';

const router = Router();

router.use('/launchpad/snaps', json());
router.post('/launchpad/snaps', newSnap);
router.get('/launchpad/snaps', findSnap);

export default router;
