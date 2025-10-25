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

// 用户
export async function createUser(user) {
  return request('/user/', { method: 'POST', json: user })
}

export async function updateUser(id, updates) {
  return request(`/user/${encodeURIComponent(id)}`, { method: 'PUT', json: updates })
}

export async function deleteUser(id) {
  return request(`/user/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function findUserFirst() {
  // 后端GET使用JSON体，浏览器不支持GET携带body，这里仅获取首条记录
  return request('/user/', { method: 'GET' })
}

// 音乐
export async function createMusic(music) {
  return request('/music/', { method: 'POST', json: music })
}

export async function updateMusic(updates) {
  // 后端PUT "/music"，需要在体内包含id及更新字段
  return request('/music', { method: 'PUT', json: updates })
}



export async function findUser(criteria) {
  const query = new URLSearchParams(criteria).toString();
  return request(`/user/?${query}`, { method: 'GET' });
}
export async function findMusic(criteria) {
  // 后端FindMusic为GET+JSON体，浏览器限制导致不可直接调用
  // 这里提示限制并返回null，建议后端改为支持查询参数或POST到查询端点
  console.warn('FindMusic在浏览器中受限：GET不能携带JSON体。请通过后端改造或使用curl等工具。')
  return { message: '浏览器限制：GET不能携带JSON体，无法调用FindMusic', body: null }
}

// 评论
export async function createComment(comment) {
  return request('/comment/', { method: 'POST', json: comment })
}

export async function updateComment(id, updates) {
  return request(`/comment/${encodeURIComponent(id)}`, { method: 'PUT', json: updates })
}

export async function deleteComment(id) {
  return request(`/comment/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function findComment(criteria) {
  // 后端FindComment为GET+JSON体，浏览器限制导致不可直接调用
  // 这里提示限制并返回null，建议后端改为支持查询参数或POST到查询端点
  console.warn('FindComment在浏览器中受限：GET不能携带JSON体。请通过后端改造或使用curl等工具。')
  return { message: '浏览器限制：GET不能携带JSON体，无法调用FindComment', body: null }
}

// 用户操作属性
export async function createUserActionProperties(userActionProperties) {
  return request('/user_action_properties/', { method: 'POST', json: userActionProperties })
}

export async function updateUserActionProperties(id, updates) {
  return request(`/user_action_properties/${encodeURIComponent(id)}`, { method: 'PUT', json: updates })
}

export async function deleteUserActionProperties(id) {
  return request(`/user_action_properties/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function findUserActionProperties(criteria) {
  // 后端FindUserActionProperties为GET+JSON体，浏览器限制导致不可直接调用
  // 这里提示限制并返回null，建议后端改为支持查询参数或POST到查询端点
  console.warn('FindUserActionProperties在浏览器中受限：GET不能携带JSON体。请通过后端改造或使用curl等工具。')
  return { message: '浏览器限制：GET不能携带JSON体，无法调用FindUserActionProperties', body: null }
}

export const listMusics = (params) => request('/music/list', { method: 'POST', json: params });

export const deleteMusic = (musicId) => request(`/music/${musicId}`, { method: 'DELETE' });

// 用户列表
export async function listUsers() {
  return request('/user/list/', { method: 'GET' });
}