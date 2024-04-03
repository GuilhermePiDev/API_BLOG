const express = require("express");
const router = express.Router();

const feedController = require("../controllers/feedController");
const { check, body } = require("express-validator");
const { validateEmail, validateTitle } = require("../services/validators");
const isAuth = require("../middleware/is-auth");

//Criar as rotas relacionadas ao feed

router.get('/posts',isAuth, feedController.getPosts);

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
router.post("/addFav/:favoriteId",isAuth , feedController.addFavorite)
router.delete("/removeFav/:favoriteId",isAuth , feedController.removeFavorite)

module.exports = router;
