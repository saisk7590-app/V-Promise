/**
 * Middleware to check if the authenticated user has an 'ADMIN' role.
 * Assumes req.user is set by verifyAuth middleware.
 */
export const checkAdmin = (req, res, next) => {
    // Note: The user schema requested 'role' should be a string like 'ADMIN'
    // but the existing DB uses 'role_id'.
    // We will handle the case where role is part of the req.user object.
    
    const userRole = req.user.role;
    
    if (!userRole || userRole.toUpperCase() !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: "Access Denied: Admin privileges required."
        });
    }
    
    next();
};
