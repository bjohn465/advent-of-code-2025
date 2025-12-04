import { readFile } from 'node:fs/promises'
import * as v from 'valibot'

class UnexpectedValueError extends Error {
	constructor(value: never) {
		super(`Received unexpected value ${String(value)}`)
	}
	static name: 'UnexpectedValueError'
}

const RotationDirection = Object.freeze({
	left: 'L',
	right: 'R',
})

const InputToRotationsSchema = v.pipe(
	v.string(),
	v.trim(),
	v.transform((input) => input.split('\n')),
	v.mapItems((line) => {
		const [direction, ...distanceArray] = [...line]
		return { direction, distance: distanceArray.join('') }
	}),
	v.array(
		v.object({
			direction: v.enum(RotationDirection),
			distance: v.pipe(
				v.string(),
				v.digits(),
				v.toNumber(),
				v.integer(),
				v.gtValue(0),
			),
		}),
	),
)
type Rotations = v.InferOutput<typeof InputToRotationsSchema>
type Rotation = Rotations[number]

async function getRotations() {
	const filePath = new URL('./input.txt', import.meta.url)
	const contents = await readFile(filePath, { encoding: 'utf8' })
	return v.parse(InputToRotationsSchema, contents)
}

function rotateLeft(fromPosition: number, distance: number) {
	let result = fromPosition - distance
	while (result < 0) {
		result = result + 100
	}
	return result
}
function rotateRight(fromPosition: number, distance: number) {
	let result = fromPosition + distance
	while (result > 99) {
		result = result - 100
	}
	return result
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

function getPositions(rotations: Rotations) {
	const initialPosition = 50
	return rotations.reduce(
		(positions, rotation) => {
			const startingPosition = positions.at(-1)
			if (startingPosition === undefined) {
				throw new Error('Unknown last position')
			}
			return [...positions, rotate(startingPosition, rotation)]
		},
		[initialPosition],
	)
}

function getZeroPositionsCount(positions: ReadonlyArray<number>) {
	return positions.reduce(
		(count, position) => (position === 0 ? count + 1 : count),
		0,
	)
}

console.log(getZeroPositionsCount(getPositions(await getRotations())))
