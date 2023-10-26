const createError = require("http-errors");
const { generateToken } = require("../utils/generateToken");
const { successResponse } = require("../utils/response");
const { signupService, getUserByEmail, updateUserService } = require("../services/user.service");
const bcrypt = require("bcryptjs");

exports.signUp = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const emailValidationPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (!firstName)
            throw createError(401, "Firstname is required.");

        if (firstName.length < 3)
            throw createError(401, "Firstname is too short.");

        if (firstName.length > 16)
            throw createError(401, "Firstname is too big.");

        if (!lastName)
            throw createError(401, "Lastname is required.");

        if (lastName.length < 3)
            throw createError(401, "Lastname is too short.");

        if (lastName.length > 16)
            throw createError(401, "Lastname is too big.");

        if (!email)
            throw createError(401, "Email is required.");

        if (!emailValidationPattern.test(email))
            throw createError(401, "Invalid email address.");

        if (!password)
            throw createError(401, "Password is required.");

        if (password.length < 6)
            throw createError(401, "Password should be at least 6 characters long.");

        const isUserExist = await getUserByEmail(email);

        if (isUserExist)
            throw createError(401, "User allready exist.");

        const user = await signupService(req.body);

        const { password: pass, ...userInfoWithoutPassword } = user.toObject();

        const token = generateToken({ email }, process.env.JWT_SECRET_KEY, "365d");

        successResponse(res, {
            status: 200,
            message: "Sign up successfull.",
            payload: { user: userInfoWithoutPassword, token }
        })
    }
    catch (err) {
        next(err);
    }
}

exports.signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email)
            throw createError(401, "Please provide your email.");

        if (!password)
            throw createError(401, "Please provide your password.");

        const user = await getUserByEmail(email);

        if (!user)
            throw createError(401, "No user found. Please create an account.");

        const isMatchedPassword = user.comparePassword(password, user.password);

        if (!isMatchedPassword)
            throw createError(401, "Your email or password is not correct.");

        const { password: pass, ...userInfoWithoutPassword } = user.toObject();

        const token = generateToken({ email }, process.env.JWT_SECRET_KEY, "365d");

        successResponse(res, {
            status: 200,
            message: "Sign in successfull.",
            payload: { user: userInfoWithoutPassword, token }
        })
    }
    catch (err) {
        next(err);
    }
}

exports.updateUser = async (req, res, next) => {
    try {


        successResponse(res, {
            status: 200,
            message: "Sign in successfull.",
            payload: { user: userInfoWithoutPassword, token }
        })
    }
    catch (err) {
        next(err);
    }
}

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword)
            throw createError(400, "Current password is required.");

        if (!newPassword)
            throw createError(400, "New password is required.");

        const user = await getUserByEmail(req.user.email);

        if (!user)
            throw createError(400, "User not found.");

        const isMatchedPassword = user.comparePassword(currentPassword, user.password);

        if (!isMatchedPassword)
            throw createError(400, "Your current password is wrong.");

        if (currentPassword === newPassword)
            throw createError(400, "New password must be different.");

        if (newPassword.length < 6)
            throw createError(400, "New password should be at least 6 characters long.");

        // Hash the new password
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

        // Update the user's password
        const result = await updateUserService(user._id, { password: hashedNewPassword });

        if (result.matchedCount === 0)
            throw createError(400, "Failed to change your password.");

        successResponse(res, {
            status: 200,
            message: "Password changed successfully.",
            payload: { result }
        })
    }
    catch (err) {
        next(err);
    }
}

