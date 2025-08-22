export function getLevelAndProgress(totalPoints) {
	const points = Math.max(0, Number(totalPoints) || 0)
	const level = Math.floor(points / 100) + 1
	const currentLevelBase = (level - 1) * 100
	const nextLevelAt = level * 100
	const progressPoints = points - currentLevelBase
	const progressPercent = Math.min(100, Math.round((progressPoints / (nextLevelAt - currentLevelBase)) * 100))
	return { level, progressPercent, progressPoints, nextLevelAt }
}