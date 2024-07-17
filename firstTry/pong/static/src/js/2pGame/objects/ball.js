import * as THREE from 'three';

export function initBall() {

    // Ball
    const ballGeometry = new THREE.SphereGeometry(0.25, 32, 32); // Adjusted ball size
    const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0.75, 0); // Set initial position with y = 0.75
    
	// Animation parameters
    let speed = 0.05; // Adjust speed as needed
    let direction = new THREE.Vector3(1, 0, 0); // Movement direction along X-axis


    ball.animate = function() {
        //updateTrail();
        ball.position.add(direction.clone().multiplyScalar(speed)); // Move ball in direction
		if (ball.position.x > 5)
		{
			direction.set(-1,0,0);
			ball.color = 0x0000ff;
			speed+=0.01;
		}
		else if (ball.position.x < -5)
		{
			direction.set(1,0,0);
			ball.color = 0xff0000;
			speed+=0.01;
		}
	};

    return ball;
}
