const axios = require('axios')

const router = require('express').Router()

module.exports = {
  ensureLoggedin: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "You must be logged in to View this resource");
    res.redirect("/api/v2/secure/login");
  },

  ensureGuest: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/api/v2/index/dashboard");
  },

  usernameToLowerCase: (req, res, next) => {
    req.body.username = req.body.username.toLowerCase();
    next();
  },

  mustBeAdmin: (req, res, next) => {
    if (req.user.role === "Admin") {
      next();
    } else {
      if (req.user.role === "Staff") {
        res.redirect("/api/v2/index/staff-dashboard");
      } else {
        res.redirect("/api/v2/index/customer-dashboard");
      }
    }
  },

  mustBeAdminOrStaff: (req, res, next) => {
    if (req.user.role === "Admin" || req.user.role === "Staff") {
      next();
    } else {
      res.status(403).json({ message: "You're not authorized to do this" });
      res.redirect("/api/v2/index/dashboard");
    }
  },

  objectLength: (obj) => {
    var result = 0;
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        // or Object.prototype.hasOwnProperty.call(obj, prop)
        result++;
      }
    }
    return result;
  },

  numFomatter: (num)=>{
    if(num >= 20000 && num < 1000000){
      return (num / 1000 ).toPrecision() + 'K'
    }else if (num >= 1000000 && num <= 1000000000){
      return (num / 1000000).toPrecision() + "M"
    }else if (num >= 1000000000){
      return (num/1000000000).toPrecision() + "B"
    }else{
      return num.toLocaleString()
    }
  },
 
  sendSms: async (to, msg)=>{
    const  Api = {
    base: 'https://www.bulksmsnigeria.com/api/v1/sms/create',
    api_token: 'yenEakqw5sTSCJ4pYf0D77GRa3RuFbqTPCUZWk4PxO4aAmKBNQ9b8jLhDFKA',
    from: 'RevolutionPlus Properties',
  };
   await axios.get(
     `${Api.base}?api_token=${Api.api_token}&from=${Api.from}&to=${to}&body=${msg}&dnd=2`
   ).then(data=>{
     console.log(data)
   }).catch(err=>{
     console.log(err)
   })

  }

};
