import * as THREE from 'three';
import { BlockWorldChunk } from './block_world_chunk.js';
import { BlockDataStore } from './block_data_store.js';
import { Blocks, BlockUtils } from './blocks.js';

class EditBox extends THREE.Group {
    constructor(){
        super();
        const geometry = new THREE.BoxGeometry(1.05,1.05,1.05);
        // this.mesh = new THREE.Mesh(geometry, Blocks.grid.materials, Blocks.grid.uvs);
        this.mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
        this.add(this.mesh);
    }
}

class BlockWorldEdit {
    constructor(){
        this.mode = "insert";
        this.blocks = BlockUtils.getBlockList();
        this.blockId = this.blocks[0].id;
    }
    next(){
        let index = 0;
        for(let i = 0; i < this.blocks.length; ++i){
            if(this.blockId == this.blocks[i].id){
                index = i;
            }
        }
        index += 1;
        index %= this.blocks.length;
        this.blockId = this.blocks[index].id;
    }
    back(){
        let index = 0;
        for(let i = 0; i < this.blocks.length; ++i){
            if(this.blockId == this.blocks[i].id){
                index = i;
            }
        }
        index -= 1;
        index = index < 0 ? this.blocks.length - 1 : index;
        this.blockId = this.blocks[index].id;
    }
}

class BlockWorld extends THREE.Group {
    constructor(){
        super();
        this.chunkSize = {
            w:32,
            h:10,
            d:32,
        };
        this.drawSize = 3;
        this.dataStore = new BlockDataStore();
        this.editBox = new EditBox();
        this.edit = new BlockWorldEdit();
    }
    save(){
        localStorage.setItem("block_world_data", JSON.stringify(this.dataStore.data));
        console.log("save");
    }
    load(){
        this.dataStore.data = JSON.parse(localStorage.getItem("block_world_data"));
        console.log("load");
        this.generate();
    }
    containsData(dataName){
        return localStorage.getItem(dataName) !== null;
    }
    generate(clearCache = false){
        if(clearCache){
            this.dataStore.clear();
        }
        this.disposeChunks();
        
        this.add(this.editBox);

        for(let x = -this.drawSize; x <= this.drawSize; ++x){
            for(let z = -this.drawSize; z <= this.drawSize; ++z){
                this.createChunk(x,z);
            }
        }
    }
    createChunk(x,z){
        const chunk = new BlockWorldChunk(this.chunkSize.w,this.chunkSize.h,this.chunkSize.d,this.dataStore);
        chunk.position.set(x * this.chunkSize.w,0,z * this.chunkSize.d);
        chunk.init();
        chunk.userData = {x,z};
        
        this.add(chunk);
    }
    getChunk(x,z){
        return this.children.find((chunk) => {
            return chunk.userData.x === x && chunk.userData.z === z
        });
    }
    disposeChunks() {
        this.traverse((chunk) => {
          if (chunk.disposeInstances) {
            chunk.disposeInstances();
          }
        });
        this.clear();
      }
    worldToChunkCoords(x,y,z){
        const chunkCoords = {
            x: Math.floor(x / this.chunkSize.w),
            z: Math.floor(z / this.chunkSize.d),
        }
        const blockCoords = {
            x: x - this.chunkSize.w * chunkCoords.x,
            y: y,
            z: z - this.chunkSize.h * chunkCoords.z
        }
        return {
            chunk: chunkCoords,
            block: blockCoords,
        }
    }
    getBlock(x,y,z){
        const coords = this.worldToChunkCoords(x,y,z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);
        if(chunk) {
            return chunk.getBlock(coords.block.x,coords.block.y,coords.block.z);
        }
        return null;
    }
    addBlock(x,y,z,id)
    {
        const coords = this.worldToChunkCoords(x,y,z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);
        if(chunk && chunk.isBounds(coords.block.x,coords.block.y,coords.block.z)) {
            chunk.addBlock(coords.block.x,coords.block.y,coords.block.z,id);
            this.hideBlock(x - 1, y, z);
            this.hideBlock(x + 1, y, z);
            this.hideBlock(x, y - 1, z);
            this.hideBlock(x, y + 1, z);
            this.hideBlock(x, y, z - 1);
            this.hideBlock(x, y, z + 1);
        }
    }
    removeBlock(x,y,z){
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);
    
        if (chunk) {
          chunk.removeBlock(
            coords.block.x,
            coords.block.y,
            coords.block.z
          );
    
          this.revealBlock(x - 1, y, z);
          this.revealBlock(x + 1, y, z);
          this.revealBlock(x, y - 1, z);
          this.revealBlock(x, y + 1, z);
          this.revealBlock(x, y, z - 1);
          this.revealBlock(x, y, z + 1);
        }
    }
    revealBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);
    
        if (chunk) {
          chunk.addBlockInstance(
            coords.block.x,
            coords.block.y,
            coords.block.z
          )
        }
      }
    hideBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);
    
        if (chunk && chunk.isBlockObscured(coords.block.x, coords.block.y, coords.block.z)) {
          chunk.deleteBlockInstance(
            coords.block.x,
            coords.block.y,
            coords.block.z
          )
        }
      }
    setEditBoxPosition(x,y,z){
        this.editBox.position.set(x,y,z);
    }
}

export {BlockWorld}