import * as usersService from "./users.service.js";

export async function createUser(request, response) {
  const user = await usersService.createUser(request.body);
  response.status(201).json({ data: user });
}

export async function listUsers(request, response) {
  const result = await usersService.listUsers(request.query);
  response.json(result);
}
