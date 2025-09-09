const USERS = { admin: 'secret' };

export function authenticate(username, password) {
  return USERS[username] === password;
}
