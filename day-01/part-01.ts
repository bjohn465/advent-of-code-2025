import { readFile } from 'node:fs/promises'
import * as v from 'valibot'

export class UnexpectedValueError extends Error {
	constructor(value: never) {
		super(`Received unexpected value ${String(value)}`)
	}
	static name: 'UnexpectedValueError'
}

export const RotationDirection = Object.freeze({
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
export type Rotations = v.InferOutput<typeof InputToRotationsSchema>
export type Rotation = Rotations[number]

export async function getRotations() {
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

export const initialDialPosition = 50

function getPositions(rotations: Rotations) {
	return rotations.reduce(
		(positions, rotation) => {
			const startingPosition = positions.at(-1)
			if (startingPosition === undefined) {
				throw new Error('Unknown last position')
			}
			return [...positions, rotate(startingPosition, rotation)]
		},
		[initialDialPosition],
	)
}

function getZeroPositionsCount(positions: ReadonlyArray<number>) {
	return positions.reduce(
		(count, position) => (position === 0 ? count + 1 : count),
		0,
	)
}

console.log(getZeroPositionsCount(getPositions(await getRotations())))
