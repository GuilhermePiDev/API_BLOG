const { validationResult } = require("express-validator");
const User = require("../models/user")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.signUpUser = (req, res, next) => {
    const errors = validationResult(req);
    //Mudar esta validação para um captar no app
    //use, em todas as requisições!
    if (!errors.isEmpty()) {
        //Criei um objeto do tipo ERROR e adicionei (com os nomes que escolhi)
        //mais duas propriedades: data e statusCode
        const error = new Error("Falha de validação");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    //A senha está sendo salva em formato texto!!!
    //um problema!! Salvar ela criptografada!
    bcrypt.hash(password, 12).then(passHashed => {
        //Add este post ao DB
        const user = new User({
            email: email,
            name: name,
            password: passHashed,
        })

        user.save()
            .then(result => {
                res.status(201).json({
                    message: "User criado com sucesso!!",
                    result: result
                })
            }).catch(error => {
                res.status(500).json({
                    message: "Error ao salvar o user...",
                    result: error
                })
            })
    })
}
exports.signInUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    //Buscar user na base de dados com o email enviado
    await User.findOne({ email: email })
        .then(user => { //user é o que ele retorna
            //validar que email não existe na base
            console.log(user)
            if (!user) {
                const error = new Error("Usuário não encontrado...");
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        }).then(passIsEqual => {
            if (!passIsEqual) {
                const error = new Error("Email ou senha errada...");
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
                "MinhaChaveSecreta!@2024%NodeJS",
                { expiresIn: "1h" }
            )
            return res.status(200).json({ message: "Usuário logado com sucesso!", userId: loadedUser._userId, token: token, })
        })
        .catch(error => {
            console.log(error)
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
}

exports.changeName = async (req, res, next) => {
    const newName = req.body.name;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Usuário não encontrado...");
            error.statusCode = 404;
            throw error;
        }

        user.name = newName;
        const result = await user.save();

        res.status(200).json({
            message: "Nome do usuário atualizado com sucesso!",
            result: result
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.changePassword = async (req, res, next) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Usuário não encontrado...");
            error.statusCode = 404;
            throw error;
        }

        const isEqual = await bcrypt.compare(oldPassword, user.password);
        if (!isEqual) {
            const error = new Error("Senha antiga incorreta...");
            error.statusCode = 401;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        const result = await user.save();

        res.status(200).json({
            message: "Senha do usuário atualizada com sucesso!",
            result: result
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deleteUser = async (req, res, next) => {
    const userID = req.userId;
    const password = req.body.password;

    const user = await  User.findById(userID);
    if (!user) {
        const error = new Error("Usuário não encontrado...");
        error.statusCode = 404;
        throw error;
    }

    const isEqual = await  bcrypt.compare(password, user.password);
    if (!isEqual) {
        const error = new Error("Senha incorreta...");
        error.statusCode = 401;
        res.status(401).json({
            msg: "Senha incorreta"
        });
        throw error;
    }
    console.log(userID)
    User.deleteOne({ _id: userID })
        .then(() => {
            console.log(userID);
            res.status(200).json({
                msg: "User excluído com sucesso!",
                User: userID
            });
        })
}



