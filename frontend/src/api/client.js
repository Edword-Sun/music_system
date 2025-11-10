// 简易API客户端，封装与后端的交互

const BASE = import.meta.env.VITE_API_BASE || '' // 开发环境走vite代理，生产可设置VITE_API_BASE

async function request(path, { method = 'GET', json } = {}) {
  const headers = {}
  let body
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  }
  const res = await fetch(BASE + path, { method, headers, body })
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return await res.json()
  }
  return await res.text()
}

// 健康检查
export async function checkHealth() {
  return request('/health', { method: 'GET' })
}

// 用户相关
export async function createUser(user) {
  return request('/user', { method: 'POST', json: user })
}

export async function updateUser(user) {
  return request('/user/', { method: 'PUT', json: user })
}

export async function deleteUser(id) {
  return request(`/user/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function findUser(criteria) {
  return request('/user/find', { method: 'POST', json: criteria });
}

export async function listUsers(params) {
  return request('/user/list/', { method: 'POST', json: params });
}

export async function login(credentials) {
  return request('/user/login', { method: 'POST', json: credentials });
}

export async function register(userInfo) {
  return request('/user/register', { method: 'POST', json: userInfo });
}

// 音乐相关
export async function createMusic(music) {
  return request('/music/', { method: 'POST', json: music })
}

export async function updateMusic(music) {
  return request('/music', { method: 'PUT', json: music })
}

export async function findMusic(criteria) {
  return request('/music/find', { method: 'POST', json: criteria });
}

export const listMusics = (params) => request('/music/list', { method: 'POST', json: params });

export const deleteMusic = (musicId) => request(`/music/${musicId}`, { method: 'DELETE' });

// 评论相关
export async function createComment(comment) {
  return request('/comment', { method: 'POST', json: comment })
}

export async function updateComment(comment) {
  return request('/comment', { method: 'PUT', json: comment })
}

export async function deleteComment(id) {
  return request('/comment', { method: 'DELETE', json: { id: id } })
}

export async function findComment(criteria) {
  return request('/comment/find', { method: 'POST', json: criteria });
}

export const listComments = (params) => request('/comment/list', { method: 'POST', json: params });

// 用户操作属性相关
export async function createUserActionProperties(userActionProperties) {
  // 后端路由为 g.POST("", h.CreateUserActionProperties) 对应路径 /uap（无尾斜杠），避免 404
  return request('/uap', { method: 'POST', json: userActionProperties })
}

export async function updateUserActionProperties(userActionProperties) {
  return request('/uap', { method: 'PUT', json: userActionProperties })
}

export async function deleteUserActionProperties(id) {
  return request(`/uap/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function findUserActionProperties(criteria) {
  return request('/uap/find', { method: 'POST', json: criteria });
}