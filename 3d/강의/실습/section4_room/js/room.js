import * as THREE from "https://unpkg.com/three@0.108.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js";

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let scene, camera, renderer;
let controls;

const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(400, 250, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x000000); //배경 컬러
    document.body.appendChild(renderer.domElement);

    //카메라 컨트롤
    controls = new OrbitControls(camera, renderer.domElement);
    //구 밖으로 스크롤 못하게
    controls.minDistance = 200;
    controls.maxDistance = 400;
    controls.enableDamping = true;

    {
        const imageLoader = new THREE.TextureLoader();
        // imageLoader.load("./image/room.jpg", (data) => {
            imageLoader.load("./image/bg.jpg", (data) => {
            const material = new THREE.MeshBasicMaterial({
                map: data,
                //BackSide 구 안에다가 매핑/ FrontSide: 구 밖에서 매핑 (얜 그래서 동그라미에 덮으면 동그라미에 쏙 들어감)
                // side: THREE.BackSide,
                side: THREE.FrontSide,
            });
            const geometry = new THREE.SphereGeometry(100, 32, 32);
            const roomMesh = new THREE.Mesh(geometry, material);
            scene.add(roomMesh);
        });
    }

    {
        const imageLoader = new THREE.TextureLoader();
        imageLoader.load("./image/room.jpg", (data) => {
            // imageLoader.load("./image/bg.jpg", (data) => {
            const material = new THREE.MeshBasicMaterial({
                map: data,
                //BackSide 구 안에다가 매핑/ FrontSide: 구 밖에서 매핑 (얜 그래서 동그라미에 덮으면 동그라미에 쏙 들어감)
                side: THREE.BackSide,
                // side: THREE.FrontSide,
            });
            const geometry = new THREE.SphereGeometry(400, 32, 32);
            const roomMesh = new THREE.Mesh(geometry, material);
            scene.add(roomMesh);
        });
    }
    renderer.render(scene, camera);
};

const animate = () => {
    camera.lookAt(scene.position);
    camera.updateProjectionMatrix();

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

const stageResize = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
};

init();
animate();
window.addEventListener("resize", stageResize);
