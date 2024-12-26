import * as THREE from "https://unpkg.com/three@0.108.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://unpkg.com/three@0.108.0/examples/jsm/loaders/FBXLoader.js";

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let scene, camera, renderer;
let controls;

let mixers = [];
let action;

//샘플 3d 모델링 다운로드
//1. https://www.mixamo.com/
//2. https://free3d.com/ko/3d-models/fbx
//3. https://www.turbosquid.com/

const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#eee"); //배경 컬러
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 0.1, 2000);
    camera.position.set(50, 50, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);

    //카메라 컨트롤
    controls = new OrbitControls(camera, renderer.domElement);

    const axes = new THREE.AxesHelper(150);
    scene.add(axes);

    const gridHelper = new THREE.GridHelper(240, 20);
    scene.add(gridHelper);

    //바닥
    const geometry = new THREE.CylinderGeometry(400, 400, 5, 100);
    const material = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -2, 0);
    //바닥에 본체 내부 쉐도우 처리를 해야만 객체에서 쉐도우 처리했을때 그림자가 뜬다..
    mesh.receiveShadow = true;
    scene.add(mesh);

    {
        //조명 넣기
        var light = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
        light.position.set(100, 100, 100);
        scene.add(light);
    }
    {
        //조명
        const color = 0xffffff;
        const intensity = 0.6;
        //그림사 생성하려면 PointLight 사용해야함.
        const light = new THREE.PointLight(color, intensity);
        //쉐도우 처리해야하고.
        light.castShadow = true;

        light.position.set(40, 120, 40);

        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.radius = 5;

        const sphereSize = 10;

        const pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
        scene.add(pointLightHelper);
        scene.add(light);
    }

    {
        //안개
        const near = 100;
        const far = 300;
        const color = "#eeeeee";
        scene.fog = new THREE.Fog(color, near, far);
    }

    const fbxLoader = new FBXLoader();

    fbxLoader.load(
        // "./model/Taunt.fbx",
        "./model/breakdance.fbx",
        (object) => {
            console.log(object);

            object.traverse(function (child) {
                if (child.isMesh) {
            // 객체를 그림자 생성하는 파트
                    child.castShadow = true;
            // 객체 내부에 그림자를 생성하는 파트 (다른 객체가 있으면 그 객체의 그림자가 생기는듯?)
                    // child.receiveShadow = true;
                }
            });

            // //애니메이션
            
            object.mixer = new THREE.AnimationMixer(object);
            // console.log(object.mixer);

            mixers.push(object.mixer);
            // console.log(mixers.length);

            if (mixers.length > 0) {
                // animations > 몇번째 tracks이 데이터가 들어가 있는지 확인해서 배열 찍어야 나옴.
                action = object.mixer.clipAction(object.animations[1]);
                // console.log(object.animations);
                action.play();

                //한번만 재생되고 멈춤.
                // action.setLoop(0,1)
            }

            object.scale.set(0.3, 0.3, 0.3);
            // object.position.y = 0;
            // object.position.x = -25;
            // object.position.z = 55;
            scene.add(object);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
            console.log(error);
        }
    );

    document.addEventListener("keydown", onDocumentKeyDown);
};

let keyCode = 0;

const onDocumentKeyDown = (event) => {
    keyCode = event.key || event.keyCode;
    //console.log(event.key, event.keyCode);

    //Ctrl키를 누르면 애니메이션 동작/ 아무다른 키 누르면 stop
    if (keyCode == "Control" || keyCode == 17) {
        action.play();
        // action.setLoop(0, 1);
    } else {
        action.stop();
    }
};

const clock = new THREE.Clock();

const animate = () => {
    const delta = clock.getDelta();


    //mixers를 업데이트 해줘야, 애니메이션이 동작합니다.
    for (let i = 0; i < mixers.length; i++) {
        mixers[i].update(delta);
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

//fbxLoadFunc("./model/car.FBX");
// fbxLoadFunc("./model/standing.FBX");
// fbxLoadFunc("./model/Building_1/building.fbx");

const fbxLoadFunc = (modelName) => {
    const fbxLoader = new FBXLoader();

    fbxLoader.load(
        modelName,
        (object) => {
            console.log(object);

            object.traverse(function (child) {
                if (child.isMesh) {
                    console.log(child);
                    child.castShadow = true;
                    // child.receiveShadow = true;
                }
            });

            //애니메이션
            // if (object.animations != undefined) {
            //     object.mixer = new THREE.AnimationMixer(object);
            //     // console.log(object.mixer);

            //     mixers.push(object.mixer);
            //     // console.log(mixers.length);

            //     if (mixers.length > 0) {
            //         var action = object.mixer.clipAction(object.animations[0]);
            //         //console.log(object.animations);
            //         action.play();
            //     }
            // }

            //크기 조절
            let scaleNum = 0.4;
            object.scale.set(scaleNum, scaleNum, scaleNum);

            //위치 조정
            object.translateX(-30);
            object.translateY(-50);
            // object.translateZ(40);
            // object.position.set(0, 0, 0);
            scene.add(object);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
            console.log(error);
        }
    );
};
