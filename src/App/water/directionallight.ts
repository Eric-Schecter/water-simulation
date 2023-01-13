import { vec3, vec4 } from "gl-matrix";

export class DirectionalLight {
	constructor(
		public color = vec4.create(),
		public direction = vec3.create(),
		public intensity = 0
	) {}
};