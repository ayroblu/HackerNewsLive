var nodemailer = require('nodemailer');

var smtpConfig = {
  service: 'sendgrid',
  pool: true,
  maxMessages: 'Infinity',
  maxConnections: 20,
  auth: {
    user: 'CME_Connect',
    pass: 'rKjEc4R2WGPJmT'
  }
};
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(smtpConfig);

// setup e-mail data with unicode symbols
//var mailOptions = {
//  from: 'Fred Foo 👥 <foo@blurdybloop.com>', // sender address
//  to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
//  subject: 'Hello ✔', // Subject line
//  text: 'Hello world 🐴', // plaintext body
//  html: '<b>Hello world 🐴</b>' // html body
//};


module.exports = {
  sendEmail: function(mailOptions, callback){
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.error(error);
        cb(error);
        return;
      }
      console.log('Message sent: ' + info.response);
      cb(null, info);
    });
    
  }
};
