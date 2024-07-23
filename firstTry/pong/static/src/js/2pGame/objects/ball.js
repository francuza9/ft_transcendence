import * as THREE from 'three';

export class Ball {
    constructor() {
        // Ball geometry and material
        const ballGeometry = new THREE.SphereGeometry(0.25, 8, 32);
        const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
		const ballMaterial2 = new THREE.MeshLambertMaterial({ color: 0x000000 });

		this.color = 0xffffff;

        // Ball mesh
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
		this.ball2 = new THREE.Mesh(ballGeometry, ballMaterial2);
        this.ball.position.set(0, 0.75, 0); // Set initial position with y = 0.75
		this.ball2.position.set(0, 0.75, 0);
		this.ball2.rotation.y = 0.1;
		this.ball.rotation.x = Math.PI / 2;
		this.ball2.rotation.x = Math.PI / 2;


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
		this.ball2.position.set(this.ball.position.x, this.ball.position.y, this.ball.position.z);
	
		// this.ball.rotation.x += this.direction.z * 0.1;
		// this.ball.rotation.y += -this.direction.x * 0.1;
		this.ball.rotation.y -= this.direction.x / 15;
		
		// this.ball.rotation.x -= (this.ball.rotation.y * this.ball.rotation.z) % (Math.PI );

		// this.ball.rotation.y += 0.1 * this.direction.z;
		this.ball2.rotation.y = this.ball.rotation.y + 0.1;
		this.ball2.rotation.z = this.ball.rotation.z;
		this.ball2.rotation.x = this.ball.rotation.x;

	    this.adjustColorTowardsWhite();
	}

	adjustColorTowardsWhite() {
    // Extract RGB components
    	let r = (this.color >> 16) & 0xFF;
    	let g = (this.color >> 8) & 0xFF;
    	let b = this.color & 0xFF;
	
    	// Increment each component, ensuring it does not exceed 0xFF
    	r = Math.min(r + 1, 0xFF);
    	g = Math.min(g + 1, 0xFF);
    	b = Math.min(b + 1, 0xFF);
	
    	// Combine back into a single color
    	this.color = (r << 16) | (g << 8) | b;
	
    	// Update the ball's material color
    	this.ball.material.color.setHex(this.color);
	}

    getMesh() {
        return this.ball;
    }

	getMesh2() {
		return this.ball2;
	}
}
