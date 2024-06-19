import { headerBuilder } from "./modules/headerBuilder.mjs";

export default {
	async fetch(request, env, ctx) {
		const { pathname } = new URL(request.url);
		if (request.method == "OPTIONS") {
			return new Response("", await headerBuilder(200));
		}
		if (pathname === "/users") {
			if (request.method == "POST") {//When method for pathname "/user" is "POST"
				try {//try to get parameters supposed to be in request json
					const data = await request.json();
					let userName = data.name;
					let userEmail = data.email;
					let userPassword = data.password;
					const id = btoa(userEmail + userName);//generate id roughly for now
					try {
						const { results: queryresult } = await env.DATABASE.prepare(
							"SELECT * FROM Users WHERE userId = ?"
						).bind(id).all();
						if (queryresult.length != 0) {
							return new Response(JSON.stringify({ "error": "multiple account", "message": "You have multiple account on server. Please contact support." }), await headerBuilder(500))
						}
						else if (queryresult.length == 0) {
							await env.DATABASE.prepare(
								"INSERT INTO Users VALUES(?,?,?,?)"
							).bind(id, userName, userEmail, userPassword)
								.run();
							return new Response(JSON.stringify({
								"id": id,
								"name": userName,
								"email": userEmail
							}), await headerBuilder(201));
						}
					}
					catch (error) {
						return new Response(JSON.stringify({ "error": "Database error.", "message": error }), await headerBuilder(500))
					}
				}
				catch (error) { //when failed to get parameters in request json
					console.log(error);
					return new Response(JSON.stringify({ "error": "required value not specified.", "message": "You don't specify some or any parameters that you have to post." }), await headerBuilder(400))
				}
			}
			else {//When method for pathname "/user" is NOT "POST"
				return new Response(JSON.stringify({
					"error": "Method not allowed.",
					"message": "Your method is not allowed."
				}), await headerBuilder(405));
			}
		}
		else if (pathname === "/login") {
			if (request.method == "POST") {
				try {
					const data = await request.json();
					let userEmail = data.email;
					let userPassword = data.password;
					//何らかの処理
					if (true) {
						const token = btoa(userEmail);//generate token for now roughly
						return new Response(JSON.stringify({
							"token": token
						}), await headerBuilder(200));
					}
					else {
						return new Response(JSON.stringify({ "error": "Authentication failed.", "message": "You can not log in to service. Maybe you entered wrong password or email?" }), await headerBuilder(401));
					}
				}
				catch (error) {
					console.log(error);
					return new Response(JSON.stringify({ "error": "required value not specified.", "message": "You don't specify some or any parameters that you have to post." }), await headerBuilder(400))
				}
			}
			else {
				return new Response(JSON.stringify({
					"error": "Method not allowed.",
					"message": "Your method is not allowed."
				}), await headerBuilder(405));
			}
		}
		else if (pathname.match(/^\/users\/[a-zA-Z0-9]+$/)) {
			if (request.method == "GET") {
				const match = pathname.match(/^\/users\/([a-zA-Z0-9]+)$/);
				const id = match[1];
				console.log(id)
				try {
					const { results: queryresult } = await env.DATABASE.prepare(
						"SELECT * FROM Users WHERE userId = ?"
					).bind(id).all();
					if (queryresult.length != 1 && queryresult.length != 0) {
						return new Response(JSON.stringify({ "error": "Error: multiple account", "message": "You have multiple account on server. Please contact support." }), await headerBuilder(500))
					}
					else if (queryresult.length == 0) {
						return new Response(JSON.stringify({ "error": "User not found.", "message": "Specified user not found in this server..." }), await headerBuilder(404))
					}
					else {
						const userId = queryresult[0].id;
						const userName = queryresult[0].userName;
						const userEmail = queryresult[0].userEmail
						return new Response(JSON.stringify({
							"id": userId,
							"name": userName,
							"email": userEmail
						}), await headerBuilder(200))
					}
				}
				catch (error) {
					console.log(error);
					return new Response(JSON.stringify({ "error": "Database error.", "message": error }), await headerBuilder(500))
				}

			}
			else if (request.method == "DELETE") {
				const match = pathname.match(/^\/users\/([a-zA-Z0-9]+)$/);
				const id = match[1];
				try {
					const { results: queryresult } = await env.DATABASE.prepare(
						"SELECT * FROM Users WHERE userId = ?"
					).bind(id).all();
					if (queryresult.length == 0) {
						return new Response(JSON.stringify({ "error": "User not found.", "message": "Specified user not found in this server..." }), await headerBuilder(404))
					}
					else {
						try {
							await env.DATABASE.prepare(
								"DELETE FROM Users WHERE userId = ? "
							).bind(id).all();
							return new Response(JSON.stringify({ "message": "Sucesfully deleted user." }), await headerBuilder(200))
						}
						catch (error) {
							console.log(error)
							return new Response(JSON.stringify({ "error": "Unauthorized", "message": error }), await headerBuilder(403))
						}
					}
				}
				catch (error) {
					console.log(error)
					return new Response(JSON.stringify({ "error": "Database error.", "message": error }), await headerBuilder(500))
				}
			}
			else if (request.method == "PUT") {
				const match = pathname.match(/^\/users\/([a-zA-Z0-9]+)$/);
				const id = match[1];
				try {
					const data = await request.json();
					let userEmail = data.email;
					let userName = data.name;
					if (userEmail == undefined || userName == undefined) {
						return new Response(JSON.stringify({ "error": "required value not specified.", "message": "You don't specify some or any parameters that you have to post." }), await headerBuilder(400))
					}
					try {
						const { results: queryresult } = await env.DATABASE.prepare(
							"SELECT * FROM Users WHERE userId = ?"
						).bind(id).all();

						if (queryresult.length == 0) {
							return new Response(JSON.stringify({ "error": "User not found.", "message": "Specified user not found in this server..." }), await headerBuilder(404))
						}
						else {
							try {
								await env.DATABASE.prepare(
									"UPDATE Users SET userName = ? ,userEmail = ? WHERE userId = ? "
								).bind(userName, userEmail, id).all();
								return new Response(JSON.stringify({ "message": "Updated successfully." }), await headerBuilder(200))
							}
							catch (error) {
								console.log(error);
								return new Response(JSON.stringify({ "error": "Unauthorized", "message": error }), await headerBuilder(403))
							}
						}

					}
					catch (error) {
						console.log(error)
						return new Response(JSON.stringify({ "error": "Database error.", "message": error }), await headerBuilder(500))
					}
				}
				catch (error) {
					console.log(error);
					return new Response(JSON.stringify({ "error": "required value not specified.", "message": "You don't specify some or any parameters that you have to post." }), await headerBuilder(400))
				}
			}
			else {
				return new Response(JSON.stringify({ "error": "Method is wrong.", "message": "Specified method cannot be used in this server..." }), await headerBuilder(405))
			}
		}
		else {
			return new Response(JSON.stringify({ "error": "Pathname is wrong.", "message": "Specified pathname not found in this server..." }), await headerBuilder(404))
		}
	},
};
