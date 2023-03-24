const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const userHelpers = require('../models/user-helpers');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

