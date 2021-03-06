const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcryptjs');

module.exports = {
   signToken: (user) => {

      const payload = {
         sub: user._id,
         role: user.role,
         iat: moment().unix(), // Current time
         exp: moment().add(1, 'd').unix() // 1 dia hasta que expire el token
      }

      return { token: jwt.sign(payload, process.env.JWT_SECRET), exp: payload.exp };
   },

   hashPassword: (password) => {
      return new Promise((resolve, reject) => {
         try {
            // Generar salt
            const salt = bcrypt.genSaltSync(10);
            // Generar password hash (salt + password)
            const passwordHash = bcrypt.hashSync(password, salt);
            resolve(passwordHash)
         } catch (err) {
            throw new Error(err);
         }
      });
   },

   isValidPassword: (user, password) => {
      return new Promise((resolve, reject) => {
         try {
            resolve(bcrypt.compare(password, user.password));
         } catch (err) {
            throw new Error(err);
         }
      });
   },

   verifyToken: (token) => {
      return new Promise((resolve, reject) => {
         try {
            const payload = jwt.decode(token, process.env.JWT_SECRET);

            if (payload.exp <= moment().unix()) {
               reject({
                  status: 401,
                  message: 'Token ha expirado'
               });
            }
            resolve(payload.sub)

         } catch (err) {
            reject({
               status: 500,
               message: 'Token Inválido'
            });
         }
      });
   },

   verifyAdminToken: (token) => {
      return new Promise((resolve, reject) => {
         try {
            const payload = jwt.decode(token, process.env.JWT_SECRET);

            if (payload.exp <= moment().unix()) {
               reject({
                  status: 401,
                  message: 'Token ha expirado'
               });
            }

            if (payload.role !== 'admin') {
               reject({
                  status: 401,
                  message: 'No tienes permiso de Administrador'
               })
            }
            resolve(payload.sub)

         } catch (err) {
            reject({
               status: 500,
               message: 'Token Inválido'
            });
         }
      });
   }
}