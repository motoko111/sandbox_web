
export class ShaderLoader {
    static async loadAsync(url){
        const response = await fetch(url);
        return await response.text();
    }
}