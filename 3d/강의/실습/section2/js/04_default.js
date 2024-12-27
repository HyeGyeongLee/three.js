import * as THREE from "https://unpkg.com/three@0.108.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js";

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let scene, camera, renderer;
let boxMesh;

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

let windowHalfX = WIDTH / 2;
let windowHalfY = HEIGHT / 2;

const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(50, 50, 50);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x0e2255); //배경 컬러
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    //카메라 컨트롤

    {
        const axes = new THREE.AxesHelper(50);
        scene.add(axes);

        const gridHelper = new THREE.GridHelper(70, 20);
        scene.add(gridHelper);
    }

    {
        const HemisphereLight = new THREE.HemisphereLight(
            0xc0daf5,
            0xc0daf5,
            0.3
        );
        HemisphereLight.position.set(-50, 50, -50);
        scene.add(HemisphereLight);

        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(60, 60, 60);
        scene.add(spotLight);
    }

    const geometry = new THREE.BoxBufferGeometry(10, 10, 10);
    const material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    boxMesh = new THREE.Mesh(geometry, material);
    scene.add(boxMesh);

    document.addEventListener("mousemove", onDocumentMouseMove);
    //마우스 이벤트
};

const onDocumentMouseMove = (event) => {

    //이 계산을 통해 마우스 위치가 화면 중앙을 기준으로 얼마나 떨어져 있는지를 계산합니다

    // 마우스가 화면 중앙에 있을 때: mouseX와 mouseY는 0
    // 마우스가 중앙보다 오른쪽에 있을 때: mouseX는 양수
    // 마우스가 중앙보다 왼쪽에 있을 때: mouseX는 음수
    // 마우스가 중앙보다 아래에 있을 때: mouseY는 양수
    // 마우스가 중앙보다 위에 있을 때: mouseY는 음수 

    // 예를 들어, 마우스를 화면 오른쪽으로 움직이면 mouseX가 양수가 되어 박스가 오른쪽으로 회전하고, 왼쪽으로 움직이면 mouseX가 음수가 되어 박스가 왼쪽으로 회전하게 됩니다.

    //event.clientX : 브라우저 창 내에서 마우스의 가로(X축) 위치를 픽셀 단위로 나타냅니다
    mouseX = event.clientX - windowHalfX;

    //event.clientY : 브라우저 창 내에서 마우스의 세로(Y축) 위치를 픽셀 단위로 나타냅니다
    mouseY = event.clientY - windowHalfY;
    // console.log(mouseY);
    // console.log(event.clientX, windowHalfX, mouseX);
};

const animete = () => {
    //많이 도는 횟수 0.003
    targetX = mouseX * 0.003;
    targetY = mouseY * 0.002;

    if (boxMesh) {
        //속도제어 0.1
        boxMesh.rotation.y += 0.1 * (targetX - boxMesh.rotation.y);
        boxMesh.rotation.x += 0.1 * (targetY - boxMesh.rotation.x);
    }

    camera.lookAt(scene.position);
    //장면의 위치를 바라봄
    camera.updateProjectionMatrix();
    //변경된 값을 카메라에 적용한다

    renderer.render(scene, camera);
    requestAnimationFrame(animete);
};

const stageResize = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    //창의 가로 중심점
    windowHalfX = WIDTH / 2;
    //창의 세로 중심점
    windowHalfY = HEIGHT / 2;

    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    //카메라 비율을 화면 비율에 맞춘다
};

init();
animete();
window.addEventListener("resize", stageResize);
