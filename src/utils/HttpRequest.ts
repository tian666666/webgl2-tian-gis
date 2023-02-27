/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-02-05 22:30:36
 * @LastEditTime: 2023-02-07 21:48:30
 * @LastEditors: tianyw
 */
// 有时我们在完成时需要按名称查询对应的HTMLImageElement对象
// 此时就需要ImageInfo结构了
export class ImageInfo {
  public name: string;
  public image: HTMLImageElement;

  public constructor(path: string, image: HTMLImageElement) {
    this.name = path;
    this.image = image;
  }
}

export class HttpRequest {
  //这个函数要起作用，必须要在tsconfig.json中将default的es5改成ES2015
  // 所有 load 方法都是返回 Promise 对象，说明都是异步加载方式
  public static loadImageAsync(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject): void => {
      const image = new Image();

      image.onload = function () {
        // 调用成功状态的 resolve 回调函数
        resolve(image);
      };
      // 当 image 加载不成功时
      image.onerror = function () {
        reject(new Error("Could not load image at " + url));
      };
      // 用 url 向服务器请求要加载的 image
      image.src = url;
    });
  }

  //这个函数要起作用，必须要在tsconfig.json中将default的es5改成ES2015
  public static loadImageAsyncSafe(
    url: string,
    name: string = url
  ): Promise<ImageInfo | null> {
    return new Promise((resolve, reject): void => {
      let image: HTMLImageElement = new Image();
      image.onload = function () {
        let info: ImageInfo = new ImageInfo(name, image);
        resolve(info);
      };

      image.onerror = function () {
        resolve(null);
      };

      image.src = url;
    });
  }
  // 通过 http get 方式从服务器请求文本文件，返回的是 Promise<string>
  public static loadTextFileAsync(url: string): Promise<string> {
    return new Promise((resolve, reject): void => {
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.onreadystatechange = (ev: Event): any => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(xhr.responseText);
        }
      };

      xhr.open("get", url, true, null, null);
      xhr.send();
    });
  }
  // 通过 http get 方式从服务器请求二进制文件
  public static loadArrayBufferAsync(url: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject): void => {
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.responseType = "arraybuffer";
      xhr.onreadystatechange = (ev: Event): any => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(xhr.response as ArrayBuffer);
        }
      };
      xhr.open("get", url, true, null, null);
      xhr.send();
    });
  }
}
