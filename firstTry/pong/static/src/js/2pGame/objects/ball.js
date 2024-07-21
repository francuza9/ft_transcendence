import * as THREE from 'three';

export class Ball {
    constructor() {
        // Ball geometry and material
        const ballGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

        // Ball mesh
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.set(0, 0.75, 0); // Set initial position with y = 0.75

        // Animation parameters
        this.speed = 0.05; // Adjust speed as needed
        this.direction = new THREE.Vector3(Math.random() < 0.5 ? -1.5 : 1.5, 0, 0); // Movement direction

        // Bind animate method
        this.animate = this.animate.bind(this);
    }

	reset(){
		this.ball.position.set(0, 0.75, 0);
		this.speed = 0.05;
		this.color = 0xffffff;
		this.ball.material.color.setHex(this.color);
		this.direction = new THREE.Vector3(Math.random() < 0.5 ? -1.5 : 1.5, 0, 0);
	}

    animate() {
        // Move ball in direction
        this.ball.position.add(this.direction.clone().multiplyScalar(this.speed));
    }

    getMesh() {
        return this.ball;
    }
}
