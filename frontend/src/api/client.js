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

// 音乐相关
export async function createMusic(music) {
  return request('/music/add', { method: 'POST', json: music })
}

export async function updateMusic(music) {
  return request('/music/update', { method: 'PUT', json: music })
}

export async function findMusic(criteria) {
  return request('/music/find', { method: 'POST', json: criteria });
}

export const listMusics = (params) => request('/music/list', { method: 'POST', json: params });

export const deleteMusic = (id) => request('/music/delete', { method: 'DELETE', json: { id } });

// 音乐历史（mh）相关
export async function findMusicHistory(criteria) {
  return request('/mh/get', { method: 'POST', json: criteria })
}

export const listMusicHistories = (params) => request('/mh/list', { method: 'POST', json: params });

export async function addMusicHistory(data) {
  return request('/mh/add', { method: 'POST', json: data })
}

export async function updateMusicHistory(data) {
  return request('/mh/update', { method: 'PUT', json: data })
}

export async function deleteMusicHistory(id) {
  return request('/mh/delete', { method: 'POST', json: { id } })
}

// Streamer 相关
export function getAudioUrl(streamerId) {
  if (!streamerId) return '';
  return `${BASE}/streamer/audio?id=${encodeURIComponent(streamerId)}`;
}

export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append('audio', file);
  const res = await fetch(BASE + '/streamer/upload', {
    method: 'POST',
    body: formData,
  });
  return await res.json();
}

export const listStreamers = (params) => request('/streamer/list', { method: 'POST', json: params });
export const deleteStreamer = (id) => request('/streamer/delete', { method: 'POST', json: { id } });
