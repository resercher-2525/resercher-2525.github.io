import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/PointerLockControls.js';

let scene, camera, renderer, controls;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
const moveSpeed = 80;
const clock = new THREE.Clock();
const enemies = [];
const enemySpeed = 1.5;
let hasKey = false;
let gameOver = false;


class Enemy {
    constructor(texture) {
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.set(
            (Math.random() - 0.5) * 150,
            1,
            (Math.random() - 0.5) * 150
        );
        scene.add(this.mesh);
    }

    update() {
        this.mesh.lookAt(camera.position);
        const direction = new THREE.Vector3().subVectors(camera.position, this.mesh.position).normalize();
        this.mesh.position.add(direction.multiplyScalar(enemySpeed * clock.getDelta()));
    }
}


function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 1.7;

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Pointer Lock Controls
    controls = new PointerLockControls(camera, renderer.domElement);
    const startScreen = document.getElementById('start-screen');

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' && !controls.isLocked) {
            controls.lock();
        }
    });

    controls.addEventListener('lock', () => {
        startScreen.style.display = 'none';
        document.getElementById('background-music').play();
    });

    controls.addEventListener('unlock', () => {
        startScreen.style.display = 'flex';
    });

    scene.add(controls.getObject());


    // World
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // soft white light
    scene.add(ambientLight);

    // Trees
    const treeGeometry = new THREE.BoxGeometry(2, 15, 2);
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x4B3F2F });
    for (let i = 0; i < 200; i++) {
        const tree = new THREE.Mesh(treeGeometry, treeMaterial);
        tree.position.set(
            (Math.random() - 0.5) * 200,
            7.5,
            (Math.random() - 0.5) * 200
        );
        scene.add(tree);
    }

    // Key
    const keyGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const keyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // Gold color
    const key = new THREE.Mesh(keyGeometry, keyMaterial);
    key.name = "key";
    key.position.set(
        (Math.random() - 0.5) * 50,
        1,
        (Math.random() - 0.5) * 50
    );
    scene.add(key);

    // Door
    const doorGeometry = new THREE.BoxGeometry(5, 10, 0.5);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // SaddleBrown color
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.name = "door";
    door.position.set(0, 5, -90);
    scene.add(door);


    // Enemies
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/顔.webp', (texture) => {
        for (let i = 0; i < 10; i++) {
            enemies.push(new Enemy(texture));
        }
    });


    // Keyboard controls
    const onKeyDown = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
        }
    };

    const onKeyUp = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);


    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    if (gameOver) return;

    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (controls.isLocked === true) {

        // Update enemies
        for (const enemy of enemies) {
            enemy.update();
        }

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * moveSpeed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * moveSpeed * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);


        // Collision detection
        const playerPosition = camera.position;

        // Key
        const key = scene.getObjectByName("key");
        if (key && playerPosition.distanceTo(key.position) < 2) {
            scene.remove(key);
            hasKey = true;
            // You can add a message to the player here
        }

        // Door
        const door = scene.getObjectByName("door");
        if (door && playerPosition.distanceTo(door.position) < 5 && hasKey) {
            // Win condition
            gameOver = true;
            document.getElementById('start-screen-content').innerHTML = '<h1>You Win!</h1>';
            controls.unlock();
        }

        // Enemies
        for (const enemy of enemies) {
            if (playerPosition.distanceTo(enemy.mesh.position) < 1) {
                // Game over
                gameOver = true;
                document.getElementById('start-screen-content').innerHTML = '<h1>Game Over</h1>';
                controls.unlock();
                break;
            }
        }
    }

    renderer.render(scene, camera);
}

init();
