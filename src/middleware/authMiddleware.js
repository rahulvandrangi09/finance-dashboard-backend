const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    let token;
    // check if token is in header
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if(!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided, authorization denied"
        });
    }   
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token, authorization denied"
        });
    }
};

// Role Based Access control
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You don't have permission to access this resource"
            });
        }
        next();
    };
}

module.exports = {
    verifyToken,
    requireRole
}