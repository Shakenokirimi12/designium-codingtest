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
				}
				catch (error) { //when failed to get parameters in request json
					console.log(error);
					return new Response({ "error": "required value not specified.", "message": "You don't specify some or any parameters that you have to post." }, await headerBuilder(400))
				}
				await env.DATABASE.prepare(
					"INSERT INTO Users VALUES(?,?,?)"
				).bind(userName, userEmail, userPassword);
				const id = btoa(userName + userEmail);//generate id roughly for now
				return new Response({
					"id": id,
					"name": userName,
					"email": userEmail
				}, await headerBuilder(201));
			}
			else {//When method for pathname "/user" is NOT "POST"
				return new Response({
					"error": "Method not allowed.",
					"message": "Your method is not allowed. Method must be POST, GET, PUT, or DELETE."
				}, await headerBuilder(405));
			}
		}
		else if (pathname === "/login") {
			if (request.method == "POST") {
				try {
					const data = await request.json();
					let userEmail = data.email;
					let userPassword = data.password;
				}
				catch (error) {
					console.log(error);
					return new Response({ "error": "required value not specified.", "message": "You don't specify some or any parameters that you have to post." }, await headerBuilder(400))
				}
				//何らかの処理
				if (true) {
					const token = btoa(userEmail);//generate token for now roughly
					return new Response({
						"token": token
					}, await headerBuilder(200));
				}
				else {
					return new Response({ "error": "Authentication failed.", "message": "You can not log in to service. Maybe you entered wrong password or email?" }, await headerBuilder(401));
				}
			}
			else {
				return new Response({
					"error": "Method not allowed.",
					"message": "Your method is not allowed. Method must be POST, GET, PUT, or DELETE."
				}, await headerBuilder(405));
			}
		}
		else {
			return new Response({ "error": "Pathname is wrong.", "message": "Specified pathname not found in this server..." }, await headerBuilder(404))
		}
		return new Response('Hello World!');
	},
};
