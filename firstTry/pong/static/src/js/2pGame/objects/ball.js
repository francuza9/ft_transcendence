import * as THREE from 'three';

export class Ball {
    constructor(scene) {
        // Ball geometry and material
    	const ballGeometry = new THREE.SphereGeometry(0.25, 6, 32);
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
        this.direction = new THREE.Vector3(Math.random() < 0.5 ? -1.5: 1.5, 0, 0); // Movement direction

		this.trail = [];
		const trailGeometries = [
		    new THREE.SphereGeometry(0.2, 32, 32),
			new THREE.SphereGeometry(0.19, 32, 32),
			new THREE.SphereGeometry(0.175, 32, 32),
			new THREE.SphereGeometry(0.16, 32, 32),
		    new THREE.SphereGeometry(0.15, 32, 32),
			new THREE.SphereGeometry(0.14, 32, 32),
			new THREE.SphereGeometry(0.125, 32, 32),
			new THREE.SphereGeometry(0.11, 32, 32),
		    new THREE.SphereGeometry(0.1, 32, 32),
			new THREE.SphereGeometry(0.09, 32, 32),
			new THREE.SphereGeometry(0.075, 32, 32),
			new THREE.SphereGeometry(0.06, 32, 32),
		    new THREE.SphereGeometry(0.05, 32, 32),
			new THREE.SphereGeometry(0.045, 32, 32),
			new THREE.SphereGeometry(0.04, 32, 32),
			new THREE.SphereGeometry(0.035, 32, 32),
		    new THREE.SphereGeometry(0.025, 32, 32),
			new THREE.SphereGeometry(0.02, 32, 32),
		];
		const trailMaterials = [
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.475 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.425 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.375 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.325 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.275 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.225 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.175 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.125 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 }),
			new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.075 }),
		];


		for (let i = 0; i < trailGeometries.length; i++) {
		    const trailSphere = new THREE.Mesh(trailGeometries[i], trailMaterials[i]);
		    trailSphere.position.set(0, 0.75, 0); // Initial position, same as the ball
		    this.trail.push(trailSphere);
		    scene.add(trailSphere); // Add the sphere to the scene
		}

		this.frameCounter = 0;
		this.trailUpdateIndex = 0;

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

		this.ball.rotation.y -= this.direction.x / 15;
		this.ball2.rotation.y = this.ball.rotation.y + 0.1;

		let x = 0;
		if (this.speed > 0.25)
			x = 1;
		else if (this.speed > 0.2)
			x = 2;
		else 
			x = 3;

		if (this.frameCounter % x === 0) {
			for (let i = 0; i < this.trail.length; i++) {
            	if (i === 0) {
            	    // The first (largest) sphere directly follows the ball
            	    this.trail[i].position.set(this.ball.position.x, this.ball.position.y, this.ball.position.z);
            	} else {
            	    // Subsequent spheres follow the one before them, creating a trailing effect
            	    this.trail[i].position.lerp(this.trail[i - 1].position, 0.5);
            	}
        	}
		}
		this.frameCounter++;
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