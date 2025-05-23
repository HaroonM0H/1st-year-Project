import mysql from 'mysql2'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB
}).promise()

export { pool }

export async function getUsers() {
    
    const [rows] = await pool.query("SELECT * FROM users")
    return rows
}

export async function getUserById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE uid = ?", [id])
    return rows[0]
}

export async function createUser(username, email, password) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const [result] = await pool.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
    )
    const id = result.insertId
    return getUserById(id)
}

export async function verifyUser(username, password) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username])
    const user = rows[0]
    
    if (!user) {
        return null
    }
    
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
        return null
    }
    
    // Don't return the password to the client
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
}

export async function getRecipebyID(id) {
    const [rows] = await pool.query("SELECT * FROM recipes WHERE rid =?", [id])
    return rows[0]
}

export async function getRecipesByUserId(uid) {
    const [rows] = await pool.query("SELECT * FROM recipes WHERE uid = ?", [uid])
    return rows
}

export async function createRecipe(name, description, type, cookingtime, ingredients, instructions, userId) {
    const [result] = await pool.query(
        "INSERT INTO recipes (name, description, type, Cookingtime, ingredients, instructions, uid) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, description, type, cookingtime, ingredients, instructions, userId]
    );
    const id = result.insertId;
    return getRecipebyID(id);
}

export async function deleteRecipe(id) {
    await pool.query("DELETE FROM recipes WHERE rid = ?", [id]);
    return true;
}

export async function updateRecipe(id, name, description, type, cookingtime, ingredients, instructions) {
    await pool.query(
        "UPDATE recipes SET name = ?, description = ?, type = ?, Cookingtime = ?, ingredients = ?, instructions = ? WHERE rid = ?",
        [name, description, type, cookingtime, ingredients, instructions, id]
    );
    return getRecipebyID(id);
}

const users = await getUsers()
console.log(users)