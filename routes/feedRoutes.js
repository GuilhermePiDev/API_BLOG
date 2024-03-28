const express = require("express");
const router = express.Router();

const feedController = require("../controllers/feedController");
const { check, body } = require("express-validator");
const { validateEmail, validateTitle } = require("../services/validators");
const isAuth = require("../middleware/is-auth");

//Criar as rotas relacionadas ao feed

router.get('/posts', feedController.getPosts);

//Validar as informações
router.post('/post',isAuth,
    [
        validateTitle
    ]
    ,
    feedController.createPost);


router.patch("/post/:postID",isAuth, feedController.updatePost);
router.delete("/post/:postID",isAuth, feedController.deletePost);

router.get("/profile",isAuth , feedController.profile)

module.exports = router;
