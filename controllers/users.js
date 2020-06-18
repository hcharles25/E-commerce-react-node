const User = require("../models/Users");
const {
  EMAIL_EXIST,
  EMAIL_MISSING,
  NAME_MISSING,
  NAME_FORMAT,
  PASSWORD_FORMAT,
  PASSWORD_MISSING,
} = require("../constant/types");
const REFRESH_TOKEN_COOKIE_PATH = require("../constant/path");
const bcrypt = require("bcryptjs");
const { hashPassword } = require("../utils/hashPassword");
const {
  emailValidator,
  nameFormatValidator,
  passwordFormatValidator,
  roleFormatValidator,
} = require("../utils/formValidator");
/**
 * @desc   Get user
 * @route  GET /api/users
 * @access Private (Admin)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const type = req.query.type;
    if (!type) throw Error("Please provide type");
    if (type === "single") {
      const userId = req.query.id;
      if (!userId) throw Error("Please provide user id");

      const user = await User.findOne({ _id: userId }).select(
        "-token -password"
      );

      if (!user) throw Error("User not found");

      res.status(200).json({
        success: true,
        user,
      });
    } else if (type === "all") {
      const users = await User.find().select("-token -password");
      if (!users) throw Error("User not found");

      res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } else {
      throw Error("type should be all / single");
    }
    console.log(`Users: Get ${type} user success`.green);
    return;
  } catch (err) {
    console.log(`Users: Get user fail : ${err.message}`.red);
    res.status(404).json({
      success: false,
      errors: [err.message],
    });
    return;
  }
};

/**
 * @desc   Update user Email / Password / Name / Role
 * @route  PUT /api/users?id
 * @access Private (Admin)
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.query.id;
    if (!userId) throw Error("Please Provide User id");

    if (!req.body) {
      return res.status(204).json({ success: false, msg: "Nothing in body" });
    }

    let updateContents = {};
    let errors = [];
    // Check email
    if (req.body.email !== undefined) {
      // Check Email exist or not
      const emailValid = await emailValidator(req.body.email);
      // If exist push msg to errros[], if not allow it add in to updateContents
      if (emailValid) {
        updateContents["email"] = req.body.email;
      } else {
        errors.push(EMAIL_EXIST);
      }
    }

    // Check Name
    if (req.body.name !== undefined) {
      // Name Format validation
      const nameValid = nameFormatValidator(req.body.name);

      if (nameValid) {
        updateContents["name"] = req.body.name;
      } else {
        errors.push(NAME_FORMAT);
      }
    }

    // Check password
    if (req.body.password !== undefined) {
      // Password Format validation
      const passwordValid = passwordFormatValidator(req.body.password);

      if (passwordValid) {
        updateContents["password"] = await hashPassword(req.body.password);
      } else {
        errors.push(PASSWORD_FORMAT);
      }
    }

    // Check role
    if (req.body.role !== undefined) {
      // Role format validation
      const roleValid = roleFormatValidator(req.body.role);

      if (role) {
        updateContents["role"] = req.body.role;
      } else {
        throw Error("Role field only accept 1 / 0.  1 = Admin, 0 = User");
      }
    }
    // Errors block
    if (errors.length > 0) {
      res.status(422).json({
        success: false,
        errors,
      });
      console.log(errors);
      console.log(
        `Users: update user fail, ${errors.length} field(s) fail`.red
      );
      return;
    }
    // Without any errors
    const user = await User.findOneAndUpdate({ _id: userId }, updateContents, {
      new: true,
    });

    res.status(200).json({
      success: true,
    });
    console.log("Users: Update user success".green);
    return;
  } catch (err) {
    res.status(402).json({
      success: false,
      errors: [err.message],
    });

    console.log(`Users: Update user fail Msg: ${err.message}`.red);
    return;
  }
};

/**
 * @desc   Delete user
 * @route  DELETE /api/users:id
 * @access Private (Admin)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.query.id;
    if (!userId) throw Error("Please provide user id that you want to delete");

    await User.findOneAndRemove({ _id: userId });

    res.status(200).json({
      success: true,
    });
    console.log("Users: Delete account success".green);
    return;
  } catch (err) {
    res.status(402).json({
      success: false,
      errors: [err.message],
    });
    console.log(`Users: Delete account fail ${err.message}`.red);
    return;
  }
};

/**
 * @desc   Update address by Admin
 * @route  PUT /api/users/:id/address
 * @access Private (Admin)
 */
exports.updateAddressByAdmin = async (req, res, next) => {
  try {
    const userId = req.query.id;
    if (!userId) throw Error("Please Provide User id");

    let newAddress = {};
    const { addressLine1, addressLine2, townOrCity, postalCode } = req.body;
    // check req.body
    newAddress["addressLine1"] = addressLine1;
    newAddress["addressLine2"] = addressLine2;
    newAddress["townOrCity"] = townOrCity;
    newAddress["postalCode"] = postalCode;

    await User.findOneAndUpdate({ _id: userId }, { address: newAddress });

    res.status(200).json({ success: true });

    console.log(`Users: User ${req.user.userId} update address success`.green);
    return;
  } catch (err) {
    res.status(422).json({
      success: false,
      errors: [err.message],
    });
    console.log(`Users: user update address fail`.red);
    return;
  }
};

/**
 * @desc   Crate account by admin
 * @route  POST /api/users/create
 * @access Private (Admin)
 */
exports.createAccountByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let accountContent = {};
    let errors = [];

    //Name check
    if (name !== undefined) {
      // Name Format validation
      const nameValid = nameFormatValidator(name);

      if (nameValid) {
        accountContent["name"] = name;
      } else {
        errors.push(NAME_FORMAT);
      }
    } else {
      errors.push(NAME_MISSING);
    }

    // Email Check
    if (email !== undefined) {
      // Check Email exist or not
      const emailValid = await emailValidator(email);
      // If exist push msg to errros[], if not allow it add in to updateContents
      if (emailValid) {
        accountContent["email"] = email;
      } else {
        errors.push(EMAIL_EXIST);
      }
    } else {
      errors.push(EMAIL_MISSING);
    }

    // Password check
    if (password !== undefined) {
      // Password Format validation
      const passwordValid = passwordFormatValidator(password);

      if (passwordValid) {
        accountContent["password"] = await hashPassword(password);
      } else {
        errors.push(PASSWORD_FORMAT);
      }
    } else {
      errors.push(PASSWORD_MISSING);
    }

    // Role Check
    if (role !== undefined) {
      // Role format validation
      const roleValid = roleFormatValidator(role);

      if (roleValid) {
        accountContent["role"] = role ? 1 : 0;
      } else {
        throw Error("Role field only accept 1 / 0.  1 = Admin, 0 = User");
      }
    }

    // Errors block
    if (errors.length > 0) {
      res.status(422).json({
        success: false,
        errors,
      });
      console.log(errors);
      console.log(
        `Users: update create fail, ${errors.length} field(s) fail`.red
      );
      return;
    }
    // Without any errors
    const user = await User.create(accountContent);

    res.status(200).json({
      success: true,
      user,
    });

    console.log("Users: create account by admin success".green);
    return;
  } catch (err) {
    res.status(404).json({
      success: false,
      errors: [err.message],
    });
    console.log(`Users: create account fail ${err.message}`.red);
    return;
  }
};

/**
 * @desc   Edit Profile by user itself Email / Password / Name
 * @route  PUT /api/users/profile
 * @access Private
 */
exports.editProfileByUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(204).json({ success: false, msg: "Nothing in body" });
    }

    let updateContents = {};
    let errors = [];
    // Check email
    if (req.body.email !== undefined) {
      // Check Email exist or not
      const emailValid = await emailValidator(req.body.email);
      // If exist push msg to errros[], if not allow it add in to updateContents
      if (emailValid) {
        updateContents["email"] = req.body.email;
      } else {
        errors.push(EMAIL_EXIST);
      }
    }

    // Check Name
    if (req.body.name !== undefined) {
      // Name Format validation
      const nameValid = nameFormatValidator(req.body.name);

      if (nameValid) {
        updateContents["name"] = req.body.name;
      } else {
        errors.push(NAME_FORMAT);
      }
    }

    // Check password
    if (req.body.password !== undefined) {
      // Password Format validation
      const passwordValid = passwordFormatValidator(req.body.password);

      if (passwordValid) {
        updateContents["password"] = await hashPassword(req.body.password);
      } else {
        errors.push(PASSWORD_FORMAT);
      }
    }

    // Errors block
    if (errors.length > 0) {
      res.status(422).json({
        success: false,
        errors,
      });
      console.log(errors);
      console.log(
        `Users: update user fail, ${errors.length} field(s) fail`.red
      );
      return;
    }
    // Without any errors
    const user = await User.findOneAndUpdate(
      { _id: req.user.userId },
      updateContents,
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
    console.log(`Users: User ${req.user.userId} profile update success`.green);
    return;
  } catch (err) {
    res.status(404).json({
      success: false,
      errors: [err.message],
    });

    console.log(`Users: Profile update fail Msg: ${err.message}`.red);
    return;
  }
};

/**
 * @desc   Get user profile info by access token
 * @route  GET /api/users/profile
 * @access Private
 */
exports.getUserProfileByToken = async (req, res) => {
  try {
    // Without any errors
    const user = await User.findOne({ _id: req.user.userId });

    res.status(200).json({
      success: true,
      data: user,
    });
    console.log(`Users: ${req.user.userId} get profile success`.green);
    return;
  } catch (err) {
    res.status(402).json({
      success: false,
      errors: [err.message],
    });

    console.log(`Users: get profile fail Msg: ${err.message}`.red);
    return;
  }
};

/**
 * @desc   Delete account by user
 * @route  DELETE /api/users/profile
 * @access Private
 */
exports.deleteAccountByUser = async (req, res, next) => {
  try {
    await User.findOneAndRemove({ _id: req.user.userId });

    // Clear cookie
    res.clearCookie("refreshtoken", {
      path: REFRESH_TOKEN_COOKIE_PATH,
    });

    res.status(200).json({
      success: true,
    });

    console.log(`Users: ${req.user.userId} delete account success`.green);
    return;
  } catch (err) {
    res.status(402).json({
      success: false,
      errors: [err.message],
    });
    console.log(`Users: User delete account fail ${err.message}`.red);
    return;
  }
};

/**
 * @desc   Update address by user
 * @route  PUT /api/users/profile/address
 * @access Private
 */
exports.updateAddressByUser = async (req, res, next) => {
  try {
    let newAddress = {};
    const { addressLine1, addressLine2, townOrCity, postalCode } = req.body;
    // check req.body
    newAddress["addressLine1"] = addressLine1;
    newAddress["addressLine2"] = addressLine2;
    newAddress["townOrCity"] = townOrCity;
    newAddress["postalCode"] = postalCode;

    const user = await User.findOneAndUpdate(
      { _id: req.user.userId },
      { address: newAddress },
      { new: true }
    );

    res.status(200).json({ success: true, data: user });

    console.log(`Users: User ${req.user.userId} update address success`.green);
    return;
  } catch (err) {
    res.status(422).json({
      success: false,
      errors: [err.message],
    });
    console.log(`Users: user update address fail`.red);
    return;
  }
};
