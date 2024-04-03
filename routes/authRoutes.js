const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const auth = require("../controllers/authController");
const { validateEmail, validateName, validatePassword, validateEmailExists } = require("../services/validators");

router.post('/signup',[validateEmail, validateName, validatePassword, validateEmailExists], auth.signUpUser);
router.post('/signin',[validateEmail, validatePassword], auth.signInUser);


router.put('/changename',isAuth, auth.changeName);
router.put('/changepassword',isAuth, auth.changePassword);

router.delete('/deleteUser', isAuth, auth.deleteUser)


module.exports = router;
