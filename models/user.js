const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema =new Schema (
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Post'
            }
        ],
        favorites: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Post' 
            }
        ]
    
        
    },
    {
        timestamps: true,
    }
);

//Exportei para o mundo lá fora...
module.exports = mongoose.model('User', userSchema);