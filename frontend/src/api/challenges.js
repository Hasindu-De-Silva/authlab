import api from './client'

export const getChallenges = () => api.get('/challenges')
export const getChallenge = (id) => api.get(`/challenges/${id}`)
export const getHint = (id, level) => api.post(`/challenges/${id}/hint`, { level })
export const submitAttack = (id, payload) => api.post(`/challenges/${id}/attack`, payload)
export const validateDefender = (id, code) => api.post(`/challenges/${id}/defend`, { code })
export const completeChallenge = (id, data) => api.post(`/challenges/${id}/complete`, data)
export const getProgress = () => api.get('/progress').then(r => ({ data: r.data.progress || {} }))
export const getLeaderboard = () => api.get('/leaderboard')
