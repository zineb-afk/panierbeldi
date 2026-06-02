const User = require('../models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const ensureDbConnection = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({ message: "Base de données indisponible." });
        return false;
    }
    return true;
};

const signup = async (req, res) => {
    try {
        if (!ensureDbConnection(res)) return;
        const { firstName, lastName, email, password, dob } = req.body;
        if (!firstName || !lastName || !email || !password || !dob)
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Un compte avec cet email existe déjà." });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ firstName, lastName, email, password: hashedPassword, dob });
        await newUser.save();
        res.status(201).json({ message: "Compte créé avec succès", user: { id: newUser._id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email, dob: newUser.dob } });
    } catch (error) {
        if (error?.name === 'ValidationError')
            return res.status(400).json({ message: error.message });
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        if (!ensureDbConnection(res)) return;
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email et mot de passe requis." });
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        res.status(200).json({ message: "Connexion réussie", user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, dob: user.dob } });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        if (!ensureDbConnection(res)) return;
        const users = await User.find({}, '-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

module.exports = { signup, login, getAllUsers };