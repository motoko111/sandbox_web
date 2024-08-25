import * as THREE from 'three';

export class TextureUtils{
    // Three.Textureから指定ピクセルの色を取得できるオブジェクトを返す
    static getPixeldData(texture){
        let image = texture;
        if(texture instanceof THREE.Texture){
            image = texture.image;
        }
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext('2d');
        // Canvasのサイズを画像サイズに設定
        canvas.width = image.width;
        canvas.height = image.height;

        // 画像をCanvasに描画
        context.drawImage(image, 0, 0);

        const imageData = context.getImageData(0, 0, image.width, image.height);

        const pixelArray = Array.from(imageData.data);

        context.clearRect(0,0,image.width,image.height);

        return {
            data:pixelArray,
            width:image.width,
            height:image.height,
            getPixel:(x,y)=>{
            return [
                pixelArray[(x + y * image.width)*4+0],
                pixelArray[(x + y * image.width)*4+1],
                pixelArray[(x + y * image.width)*4+2],
                pixelArray[(x + y * image.width)*4+3]
            ];
        }};
    }
}