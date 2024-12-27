import * as THREE from "https://unpkg.com/three@0.108.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://unpkg.com/three@0.108.0/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "https://unpkg.com/three@0.108.0/examples/jsm/loaders/GLTFLoader.js";

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let scene, camera, renderer;
let controls;
let model; // Will store the loaded model
let mixers = [];

const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#eee");
    
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 2000);
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 렌더러의 물리적 조명 설정을 비활성화
    renderer.physicallyCorrectLights = false;
    renderer.outputEncoding = THREE.LinearEncoding;  // 톤 매핑 변경
    renderer.toneMapping = THREE.NoToneMapping;      // 톤 매핑 비활성화

    document.querySelector("#canvasWrap").appendChild(renderer.domElement);

    // controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.05;

    // const axes = new THREE.AxesHelper(150);
    // scene.add(axes);

    // const gridHelper = new THREE.GridHelper(440, 20);
    // scene.add(gridHelper);

    // 바닥 - 완전히 투명하고 빛을 반사하지 않도록 설정
    // const geometry = new THREE.CylinderGeometry(700, 0, 0, 100);
    // const material = new THREE.MeshBasicMaterial({  // MeshPhongMaterial 대신 MeshBasicMaterial 사용
    //     transparent: true,
    //     opacity: 0,
    //     side: THREE.DoubleSide
    // });
    // const boxMesh = new THREE.Mesh(geometry, material);
    // boxMesh.position.set(0, -5, 0);
    // boxMesh.receiveShadow = false;  // 그림자 받지 않도록 설정
    // scene.add(boxMesh);

    // 안개 설정도 제거하거나 투명하게
    {
        const near = 1000;
        const far = 2000;
        const color = "#ffffff";  // 흰색으로 변경
        scene.fog = new THREE.Fog(color, near, far);
    }

    initLights();
    gltfLoadFunc('./model/iphone_16_plus.glb');
};

const gltfLoadFunc = (modelName) => {
    const loader = new GLTFLoader();
    
    loader.load(
        modelName,
        (gltf) => {
            model = gltf.scene;
            
            // 모델의 모든 메시 순회
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            let scaleNum = 30;
            model.scale.set(scaleNum, scaleNum, scaleNum);
            model.position.set(0, 0, 0);
            model.rotation.y = 10
            scene.add(model);

            // 애니메이션이 있는 경우
            if (gltf.animations && gltf.animations.length) {
                const mixer = new THREE.AnimationMixer(model);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                mixers.push(mixer);
            }
        },
        // 로딩 진행상황
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // 에러 발생시
        (error) => {
            console.error('An error happened:', error);
        }
    );
};
    // init 함수에서 조명 부분 수정
const initLights = () => {
    // 기존 조명 모두 제거
    scene.children.forEach(child => {
        if (child.isLight) scene.remove(child);
    });

    // 전체적인 환경광
    const ambientLight = new THREE.AmbientLight(0xffffff, 6.5);
    scene.add(ambientLight);

    // 주 조명 (위에서)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(0, 200, 100);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // 부드러운 채움광 (전면에서)
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(0, 0, 0);
    scene.add(fillLight);

    // 뒤에서 비추는 림라이트
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.3);
    rimLight.position.set(0, 0, 10);
    scene.add(rimLight);


    // const sphereSize = 100;
    // const pointLightHelper = new THREE.PointLightHelper( rimLight, sphereSize );
    // scene.add( pointLightHelper );


};



const clock = new THREE.Clock();

const animate = () => {
    const delta = clock.getDelta();

    for (let i = 0; i < mixers.length; i++) {
        // Slow down the animation speed by multiplying delta
        mixers[i].update(delta * 0.8);  // Reduces animation speed by half
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};


const stageResize = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    //카메라 비율을 화면 비율에 맞춘다
};

init();
animate();
window.addEventListener("resize", stageResize);

let scrollTop = 0;

const scrollFunc = () => {
    scrollTop = window.scrollY; //현재 스크롤 위치
    console.log(scrollTop);

    //회전
    model.rotation.y = scrollTop / 2;
    model.position.z = scrollTop / 40

    // 점점 줌인
    // model.position.z = scrollTop / -70;
};

window.addEventListener("scroll", scrollFunc);
