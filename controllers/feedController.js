const { validationResult } = require("express-validator");

const User = require('../models/user');
const post = require("../models/post");

//Ao posts, mandar aos poucos, ou seja, com paginação
exports.getPosts = (req, res, next) => {

    const page = req.query.page || 1;
    const perPage = req.query.perPage || 5;
    let totalItems;

    post.find()
        .countDocuments()
        .then(total => {
            totalItems = total;

            return post.find()
                .skip((page - 1) * perPage)
                .limit(perPage);
        })
        .then(result => {
            res.status(200).json({
                totalItems: totalItems,
                posts: result
            })
        })
        .catch(error => {
            console.log(error);
        })

}

exports.createPost = (req, res, next) => {

    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty()) {
        return res.status(422).send({
            error: true,
            message: errors.array()[0].msg
        });
    }

    if (!req.file) {
        const error = new Error("Por favor envie uma imagem!")
        error.statusCode = 422;
        error.data = "Cliente não enviou imagem..."
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path;

    let postCreator;

    const postagem = new post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId,
    })

    //Add este post ao DB
    postagem.save()
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            postCreator = user;
            user.posts.push(postagem);
            return user.save()

        }).then(result => {
            res.status(201).json({
                message: "Post criado com sucesso!!",
                creator: {
                    _id: postCreator._id,
                    name: postCreator.name,
                }
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
                throw err;
            }
        })
}

//Rotas para atualizar e deletar um post

exports.updatePost = (req, res, next) => {
    const postID = req.params.postID;

    const title = req.body.title;
    const content = req.body.content;


    const updateOps = { title: title, content: content };


    post.findByIdAndUpdate(postID, { $set: updateOps }, { new: true })
        .then(result => {
            console.log("Post atualizado:", postID);
            res.status(200).json({
                msg: "Post atualizado com sucesso!",
                post: postID
            });
        })
        .catch(error => {
            console.error("Erro ao atualizar post:", error);
            res.status(500).json({
                error: error
            });
        });
}

exports.deletePost = (req, res, next) => {
    const postID = req.params.postID;
  
    post.deleteOne({ _id: postID })
        .then(() => {
            console.log(postID);
            res.status(200).json({
                msg: "Post excluído com sucesso!",
                post: postID
            });
        })

}

exports.profile = (req, res, next) => {
    const userID = req.userId;


        User.findById(userID)
        .then(result => {
            
            res.status(200).json({
                msg: "tudo certo",
                result : result
               

            });

        })

}

exports.addFavorite = async (req, res, next) => {
    const favoriteId = req.params.favoriteId;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Usuário não encontrado...");
            error.statusCode = 404;
            throw error;
        }

        user.favorites.push(favoriteId);
        const result = await user.save();

        res.status(200).json({
            message: "Favorito adicionado com sucesso!",
            result: result
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.removeFavorite = async (req, res, next) => {
    const favoriteId = req.params.favoriteId;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Usuário não encontrado...");
            error.statusCode = 404;
            throw error;
        }

        user.favorites.pull(favoriteId);
        const result = await user.save();

        res.status(200).json({
            message: "Favorito removido com sucesso!",
            result: result
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}
