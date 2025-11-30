import mysql, { ConnectionOptions } from 'mysql2/promise';

const environment: any = process.env.NODE_ENV || "development";

const {
	DB_PORT,
	DB_HOST,
	DB_USER,
	DB_PASSWORD,
	DB_NAME,
	DB_PORT_DEV,
	DB_HOST_DEV,
	DB_USER_DEV,
	DB_PASSWORD_DEV,
	DB_NAME_DEV
} = process.env;

const optionDB: any = {
	development: {
		user: DB_USER_DEV,
		database: DB_NAME_DEV,
		password: DB_PASSWORD_DEV,
		port: DB_PORT_DEV,
		host: DB_HOST_DEV
	},

	production: {
		user: DB_USER,
		database: DB_NAME,
		password: DB_PASSWORD,
		port: DB_PORT,
		host: DB_HOST
	}

}

const option = optionDB[environment]
const access: ConnectionOptions = option;
const db = mysql.createPool(access);

export default db;