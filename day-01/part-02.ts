import {
	getRotations,
	initialDialPosition,
	type Rotation,
	type Rotations,
	RotationDirection,
	UnexpectedValueError,
} from './part-01.ts'

function rotateLeft(fromPosition: number, distance: number) {
	let timesPointedToZero = 0
	let position = fromPosition
	let remainingDistance = distance
	while (remainingDistance > 0) {
		position = position - 1
		position = position < 0 ? 99 : position
		remainingDistance = remainingDistance - 1
		timesPointedToZero = timesPointedToZero + (position === 0 ? 1 : 0)
	}
	return { position, timesPointedToZero }
}
function rotateRight(fromPosition: number, distance: number) {
	let timesPointedToZero = 0
	let position = fromPosition
	let remainingDistance = distance
	while (remainingDistance > 0) {
		position = position + 1
		position = position > 99 ? 0 : position
		remainingDistance = remainingDistance - 1
		timesPointedToZero = timesPointedToZero + (position === 0 ? 1 : 0)
	}
	return { position, timesPointedToZero }
}

function rotate(fromPosition: number, rotation: Rotation) {
	switch (rotation.direction) {
		case RotationDirection.left:
			return rotateLeft(fromPosition, rotation.distance)
		case RotationDirection.right:
			return rotateRight(fromPosition, rotation.distance)
		default:
			throw new UnexpectedValueError(rotation.direction)
	}
}

function getNumberOfTimesDialPointsToZero(rotations: Rotations) {
	let position = initialDialPosition
	let timesPointedToZero = 0
	rotations.forEach((rotation) => {
		const {
			position: newPosition,
			timesPointedToZero: additionalTimesPointedToZero,
		} = rotate(position, rotation)
		timesPointedToZero = timesPointedToZero + additionalTimesPointedToZero
		position = newPosition
	})
	return timesPointedToZero
}

console.log(getNumberOfTimesDialPointsToZero(await getRotations()))
