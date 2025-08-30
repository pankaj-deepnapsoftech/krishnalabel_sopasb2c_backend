const {Schema,model} = require("mongoose");
const bcrypt = require('bcrypt');

const CustomerSchema = new Schema({
    full_name:{type:String,require:true,trim:true},
    email:{type:String,require:true,trim:true,unique:true,lowerCase:true},
    phone:{type:String,require:true,trim:true},
    type:{type:String,required:true,trim:true},
    password:{type:String,require:true},
    company_name:{type:String,trim:true},
    GST_NO:{type:String,trim:true},
},{timestamps:true});

CustomerSchema.pre("save", async function (next) {
    if(!this.isModified('password')){
        return next();
    }
    try {
        const hashedPass = await bcrypt.hash(this.password, 10);
        this.password = hashedPass;
        next();
    } catch (error) {
        next(error);
    }
})

CustomerSchema.pre("findOneAndUpdate", async function (next) {
    if(!this._update.password){
        return next();
    }

    try {
        const hashedPass = await bcrypt.hash(this._update.password, 10);
        this._update.password = hashedPass;
        next();
    } catch (error) {
        next(error);
    }
})

exports.CustomerModel = model("Customer",CustomerSchema);