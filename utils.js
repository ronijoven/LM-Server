// generate token using secret from process.env.JWT_SECRET
var jwt = require('jsonwebtoken');
 
// generate token and return it
function generateToken(user) {
  //1. Don't use password and other sensitive fields
  //2. Use the information that are useful in other parts
  if (!user) return null;
 
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24 // expires in 24 hours
  });
}
 
// return basic user details
function getCleanUser(item_user) {
  if (!item_user) return null;
 
  return {
      id: item_user.id,
      username: item_user.username,
      password: item_user.password,
      displayname: item_user.displayname,
      user_email: item_user.user_email,
      provider_id: item_user.provider_id,
      provider_model_id: item_user.provider_model_id
  };
}
 
module.exports = {
    generateToken,
    getCleanUser
}