import Router from '@koa/router'
import * as user from './app/users/index.js'
export const router = new Router();

router.post('/users', user.create)
router.get('/list', user.list)