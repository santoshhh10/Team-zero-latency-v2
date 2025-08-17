import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem('token') || '')
	const [user, setUser] = useState(() => {
		try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
	})

	useEffect(() => {
		if (token) localStorage.setItem('token', token); else localStorage.removeItem('token')
		if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user')
	}, [token, user])

	const api = useMemo(() => {
		const instance = axios.create({ baseURL: API_BASE })
		instance.interceptors.request.use((config) => {
			if (token) config.headers.Authorization = `Bearer ${token}`
			return config
		})
		return instance
	}, [token])

	const value = useMemo(() => ({ token, setToken, user, setUser, api }), [token, user, api])
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }