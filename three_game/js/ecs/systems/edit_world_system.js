import { EInputKey, Input } from "../../input.js";
import { BlockWorld } from "../../object/block_world.js";
import { Blocks } from "../../object/blocks.js";
import { ThreeRender } from "../../three_render.js";
import { BlockWorldComponent } from "../components/block_world_component.js";
import {System} from "../system.js";
import * as THREE from "three";

export class EditWorldSystem extends System {
    constructor(em) {
        super();
        this.em = em;
        this.targetEntities = [];
        this.raycaster = new THREE.Raycaster();
        this.matrix = new THREE.Matrix4();
    }

    update() {
        let _this = this;
        let blockWorld = null;
        this.targetEntities = this.em.query(this.targetEntities, BlockWorldComponent);
        this.targetEntities.forEach((entity) => {
            blockWorld = _this.em.getComponent(entity, BlockWorldComponent).blockWorld;
        });
        if(blockWorld){
            
            const mousePos = Input.getLastMousePosition();
            // -1～+1に収める
            mousePos.x = (mousePos.x / GetScreenWidth()) * 2 - 1;
            mousePos.y = -(mousePos.y / GetScreenHeight()) * 2 + 1;

            this.raycaster.setFromCamera(new THREE.Vector2(mousePos.x,mousePos.y), ThreeRender.getInstance().camera);

            const hits = this.raycaster.intersectObjects(ThreeRender.getInstance().scene.children);

            //console.log(hits.length)

            // 交差したオブジェクトがあるか確認
            if (hits.length > 0) {
                for(let n = 0; n < hits.length; ++n){
                    const mesh = hits[n].object;
                    let hitpos = null;
                    if(mesh === blockWorld.editBox.mesh){
                        continue;
                    }
                    else if(mesh instanceof THREE.InstancedMesh){
                        const instanceId = hits[n].instanceId;
                        mesh.getMatrixAt(instanceId, this.matrix);
                        const v = new THREE.Vector3();
                        v.applyMatrix4(this.matrix);
                        let x = v.x;
                        let y = v.y;
                        let z = v.z;
                        hitpos = new THREE.Vector3(x,y,z);
                    }
                    else if(mesh instanceof THREE.Object3D){
                        let v = mesh.position;
                        hitpos = new THREE.Vector3(v.x,v.y,v.z);
                    }
                    if(hitpos){
                        for(let i = 0; i < 10; ++i){
                            let block = blockWorld.getBlock(hitpos.x,hitpos.y+i,hitpos.z);
                            if(!block || block.id === Blocks.empty.id){
                                blockWorld.setEditBoxPosition(hitpos.x,hitpos.y+i,hitpos.z);
                                break;
                            }
                        }
                        break;
                    }
                }
            }

            // if(Input.isOnTriggerInputKey(EInputKey.ENTER))
            if(Input.isOnTriggerInputKey(EInputKey.ENTER))
            {
                const editPos = blockWorld.editBox.position;
                blockWorld.addBlock(editPos.x,editPos.y,editPos.z,blockWorld.edit.blockId);
            }
            // save
            else if(Input.isOnTriggerInputKey(EInputKey.DEBUG1))
            {
                blockWorld.save();
            }
            // load
            else if(Input.isOnTriggerInputKey(EInputKey.DEBUG2))
            {
                blockWorld.load();
            }
            // next
            else if(Input.isOnTriggerInputKey(EInputKey.R_SHOULDER))
            {
                blockWorld.edit.next();
            }
            // back
            else if(Input.isOnTriggerInputKey(EInputKey.L_SHOULDER))
            {
                blockWorld.edit.back();
            }
        }
    }
}