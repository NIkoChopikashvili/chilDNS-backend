const { getDb } = require("./config/db-setup");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Missing email or password");
    }
    const user = await getDb().db().collection("users").findOne({ email });
    if (user) {
      return res.status(400).send("User already exists");
    }
    const newUser = await getDb()
      .db()
      .collection("users")
      .insertOne({ email, password });
    return res.status(200).json({ user: newUser });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not register, try again" });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Missing email or password");
    }
    const user = await getDb().db().collection("users").findOne({ email });
    if (!user) {
      return res.status(400).send("User does not exist");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Incorrect password");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    return res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not login, try again" });
  }
};
