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
    camera.position.set(200, 0, -300);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    document.querySelector("#canvasWrap").appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    const axes = new THREE.AxesHelper(150);
    scene.add(axes);

    const gridHelper = new THREE.GridHelper(440, 20);
    scene.add(gridHelper);

    //바닥
    const geometry = new THREE.CylinderGeometry(700, 0, 0, 100);
        const material = new THREE.MeshPhongMaterial({
            color: 0xeeeeee,
            transparent: true,  // 투명도 활성화
            opacity: 0,      // 투명도 설정 (0: 완전 투명, 1: 완전 불투명)
            shininess: 0,    // 광택
            side: THREE.DoubleSide  // 양면 렌더링
        });
        const boxMesh = new THREE.Mesh(geometry, material);
        boxMesh.position.set(0, -5, 0);
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

    initLights();
    {
        const near = 1000;
        const far = 2000;
        const color = "#eeeeee";
        scene.fog = new THREE.Fog(color, near, far);
    }

    // Load the model
    gltfLoadFunc('./model/scene.gltf');
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

                    // material 속성 조정하되 기존 텍스처 유지
                    if (child.material) {
                        // 기존 material의 모든 속성을 복사
                        const originalMaterial = child.material;
                        
                        // 새로운 material 생성
                        const newMaterial = new THREE.MeshStandardMaterial({
                            map: originalMaterial.map,  // 컬러/디퓨즈 맵
                            normalMap: originalMaterial.normalMap,  // 노말 맵
                            roughnessMap: originalMaterial.roughnessMap,  // 거칠기 맵
                            metalnessMap: originalMaterial.metalnessMap,  // 금속성 맵
                            aoMap: originalMaterial.aoMap,  // Ambient Occlusion 맵
                            emissiveMap: originalMaterial.emissiveMap,  // 발광 맵
                            
                            color: originalMaterial.color,  // 기본 색상
                            metalness: 0.5,  // 금속성 (조절 가능)
                            roughness: 0.5,  // 거칠기 (조절 가능)
                            envMapIntensity: 1.0,  // 환경맵 강도
                            
                            transparent: originalMaterial.transparent,
                            opacity: originalMaterial.opacity
                        });

                        // UV2가 있다면 복사
                        if (child.geometry.attributes.uv2) {
                            newMaterial.aoMap = originalMaterial.aoMap;
                            newMaterial.lightMap = originalMaterial.lightMap;
                        }

                        // material 교체
                        child.material = newMaterial;
                        
                        // 디버깅을 위한 로그
                        console.log('Original material:', originalMaterial);
                        console.log('New material:', newMaterial);
                    }
                }
            });

            let scaleNum = 20;
            model.scale.set(scaleNum, scaleNum, scaleNum);
            model.position.set(0, 0, 0);
            // model.rotation.y = -10
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 12.5);
    scene.add(ambientLight);

    // 주 조명 (위에서)
    const mainLight = new THREE.DirectionalLight(0xffffff, 20);
    mainLight.position.set(0, 200, 100);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // 부드러운 채움광 (전면에서)
    const fillLight = new THREE.DirectionalLight(0xffffff, 20.5);
    fillLight.position.set(0, 0, 0);
    scene.add(fillLight);

    // 뒤에서 비추는 림라이트
    const rimLight = new THREE.DirectionalLight(0xffffff, 20.3);
    rimLight.position.set(0, 0, -200);
    scene.add(rimLight);
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
    model.position.z = scrollTop / 100

    // 점점 줌인
    // model.position.z = scrollTop / 40;
};

window.addEventListener("scroll", scrollFunc);
