const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/user.controller');

// router.get('/test', user_controller.test);
//implementing CRUD
router.post('/create', user_controller.user_create);//C to signup a user, create session
router.post('/chgpwd', user_controller.chgpwd);
// router.get('/:id', user_controller.user_details);//R
router.post('/get_user_data',user_controller.user_details);//to render the profile
// router.put('/:id/update', user_controller.user_update);//U
// router.delete('/:id/delete', user_controller.user_delete);//D
router.post('/logout',user_controller.user_lgout);// to logout, delete session
router.post('/post_as_admin',user_controller.pst_admin);//to post as admin
router.post('/lgin', user_controller.lgin);//login
router.post('/add_subs',user_controller.add_subs);//adding subscription data
router.post('/get_pub_key', user_controller.pub_key);
router.post('/get_notifs', user_controller.getNotifs);
router.post('/getsoc', user_controller.getsoc);
router.post('/add_sub_soc', user_controller.add_sub_soc);
router.post('/chkpwd', user_controller.chkpwd);
router.post('/genotp', user_controller.genotp);
router.post('/chkuser', user_controller.chkuser);
router.post('/forgemail', user_controller.forgemail);

module.exports = router;