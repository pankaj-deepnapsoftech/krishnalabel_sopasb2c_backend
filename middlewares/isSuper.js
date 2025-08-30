const {TryCatch, ErrorHandler} = require('../utils/error');

exports.isSuper = TryCatch(async (req, res, next) => {
    let superAdmin = false;
    if (req?.user?.role && !req.user?.isSuper) {
        const approvel = req?.user?.role?.permissions.filter((item)=>item === "approval")
        superAdmin = approvel?.length > 0
    } else {
        superAdmin = req.user?.isSuper
    }

    if (!superAdmin) {
        throw new ErrorHandler('You must be a superadmin to access this route', 401);
    }

    next();
})