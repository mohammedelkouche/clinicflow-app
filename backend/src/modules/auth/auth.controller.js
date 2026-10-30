import * as authService from "./auth.service.js";

export async function login(request, response) {
  const result = await authService.login(request.body);
  response.json(result);
}

export async function getCurrentUser(request, response) {
  const user = await authService.getCurrentUser(request.user.id);
  response.json({ data: user });
}
