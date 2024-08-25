import * as THREE from 'three';
import { BoxMaterial } from '../shader/box_material.js';
import { BoxEditMaterial } from '../shader/box_edit_material.js';

const textureLoader = new THREE.TextureLoader();

const padding = 0.0001;
const cellSize = 32.0 / 512; // 32x32ピクセルのセルを考慮
const cellSizeAddPadding = cellSize - padding;
const setUV = (uvs, num, xIndex, yIndex) => {
    uvs[num *8 + 0] = (xIndex + 0) * cellSize + padding;
    uvs[num *8 + 1] = (yIndex + 1) * cellSize - padding;
    uvs[num *8 + 2] = (xIndex + 1) * cellSize - padding;
    uvs[num *8 + 3] = (yIndex + 1) * cellSize - padding;
    uvs[num *8 + 4] = (xIndex + 0) * cellSize + padding;
    uvs[num *8 + 5] = (yIndex + 0) * cellSize + padding;
    uvs[num *8 + 6] = (xIndex + 1) * cellSize - padding;
    uvs[num *8 + 7] = (yIndex + 0) * cellSize + padding;
};
const setUVs = (uvs, params) => {
    for(let i = 0; i < params.length; i+=3){
        setUV(uvs, params[i+0], params[i+1], params[i+2]);
    }
}
const createUVs = (params) => {
    let uvs = [];
    setUV(uvs, 0, params.right[0], params.right[1]); // 右
    setUV(uvs, 1, params.left[0], params.left[1]); // 左
    setUV(uvs, 2, params.top[0], params.top[1]); // 上
    setUV(uvs, 3, params.bottom[0], params.bottom[1]); // 下
    setUV(uvs, 4, params.front[0], params.front[1]); // 前
    setUV(uvs, 5, params.back[0], params.back[1]); // 後
    return uvs;
};

let loadTexture = (path) => {
    const texture = textureLoader.load(path);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture;
};

const textures = {
default: loadTexture("./assets/model/quad6_uv.png"),
water: loadTexture("./assets/model/water.png"),
grid: loadTexture("./assets/model/grid.png"),
};

const Blocks = {
    empty: {
        id: 0,
        name: 'empty',
        visible: false
    },
    test : {
        debug:true,
        id:-1,
        name:"test",
        materials:[
            new BoxMaterial(textures.default),
            new BoxMaterial(textures.default),
            new BoxMaterial(textures.default),
            new BoxMaterial(textures.default),
            new BoxMaterial(textures.default),
            new BoxMaterial(textures.default),
        ],
        uvs:createUVs({
            top:[1,2],
            right:[1,1],
            left:[0,1],
            bottom:[1,0],
            front:[1,1],
            back:[0,0],
        })
    },
    water : {
        id:20,
        name:"water",
        materials:[
            new BoxMaterial(textures.water, {u_uv_scroll:new THREE.Vector2(0.0,0.4), opacity:0.8}),
            new BoxMaterial(textures.water, {u_uv_scroll:new THREE.Vector2(0.0,0.4), opacity:0.8}),
            new BoxMaterial(textures.water, {u_uv_scroll:new THREE.Vector2(0.1,0.1), opacity:0.8}),
            new BoxMaterial(textures.water, {u_uv_scroll:new THREE.Vector2(0.0,0.1), opacity:0.8}),
            new BoxMaterial(textures.water, {u_uv_scroll:new THREE.Vector2(0.0,0.4), opacity:0.8}),
            new BoxMaterial(textures.water, {u_uv_scroll:new THREE.Vector2(0.0,0.4), opacity:0.8}),
        ],
        uvs:[0,1,1,1,0,0,1,0, 0,1,1,1,0,0,1,0, 0,1,1,1,0,0,1,0, 0,1,1,1,0,0,1,0, 0,1,1,1,0,0,1,0, 0,1,1,1,0,0,1,0,]
    },
    grid : {
        debug:true,
        id:30,
        name:"grid",
        materials:[
            new BoxEditMaterial(textures.grid),
            new BoxEditMaterial(textures.grid),
            new BoxEditMaterial(textures.grid),
            new BoxEditMaterial(textures.grid),
            new BoxEditMaterial(textures.grid),
            new BoxEditMaterial(textures.grid),
        ],
        uvs:[0,1,1,1,0,0,1,0, 0,1,1,1,0,0,1,0, 0,1,1,1,0,0,1,0, 0,1,1,1,0,0,1,0, 0,1,1,1,0,0,1,0, 0,1,1,1,0,0,1,0,]
    }
}

const top3x3 = (base_name, start_id, start_x,start_y, option) => {
    //Blocks[base_name] = [];
    for(let y = 0; y < 3; y ++){
        for(let x = 0; x < 3; x ++){
            let n = (x + y * 3);
            let id = start_id + n;
            let name = base_name + "_" + n;
            Blocks[name] = {
                id:id,
                name:name,
                materials:[
                    new BoxMaterial(textures.default, option),
                    new BoxMaterial(textures.default, option),
                    new BoxMaterial(textures.default, option),
                    new BoxMaterial(textures.default, option),
                    new BoxMaterial(textures.default, option),
                    new BoxMaterial(textures.default, option),
                ],
                uvs:createUVs({
                    top:[start_x + x,start_y + 2 + y],
                    right:[start_x+1,start_y + 1],
                    left:[start_x+0,start_y + 1],
                    bottom:[start_x+1,start_y + 0],
                    front:[start_x+1,start_y + 1],
                    back:[start_x+0,start_y + 0],
                })
            }
            //Blocks[base_name].push(Blocks[name]);
        }
    }
};

top3x3("grass", 10, 3, 0);
//top3x3("water", 20, 6, 0, );


class BlockUtils {
    static random(ignore_debug = true){
        const blocks = Object.values(Blocks)
        .filter(block=>block.id !== Blocks.empty.id && ( ignore_debug ? (!block.debug) : true ));

        return blocks[Math.floor(Math.random() * (blocks.length))]
    }
    static getBlockList(ignore_debug = true){
        return Object.values(Blocks)
        .filter(block=>block.id !== Blocks.empty.id && ( ignore_debug ? (!block.debug) : true ));
    }
}

export {Blocks, BlockUtils};