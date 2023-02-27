/* SAMPLE ------------------------------------------------------
var dl = new Downloader(
	{ type:"shader", file:"../../fungi/shaders/VecWColor.txt" },
	{ type:"image", name:"tex01", file:"../../images/UV_Grid_Sm.jpg", doYFlip:true, useMips:false }
]);

dl.start()
	.then(()=>{ console.log("All Done", dl.complete); })
	.catch((err)=>{ console.log("catch",err); });

Promise.all([p]).then(values=>{ console.log(values); },reason =>{ console.log(reason); });
 -------------------------------------------------------------*/

class IXMLHttpRequest extends XMLHttpRequest {
  inUse: boolean = false;
  activeItem: any;
  constructor() {
    super();
  }
}
class Downloader {
  debug: boolean;
  _imgPool: any[];
  _imgPoolLen: number;
  _imgComplete: any;
  _imgError: any;
  _xhrPoolLen: any;
  _xhrPool: IXMLHttpRequest[];
  _queue: any[];
  complete: any[];
  _promise: any;
  _resolve: any;
  _reject: any;
  constructor(dlAry: any = null, xhrLen = 5, imgLen = 3) {
    this.debug = false;
    this.complete = [];

    this._promise = null;
    this._resolve = null;
    this._reject = null;
    this._queue = [];

    //.............................
    //Setup Image DL Pool
    this._imgPoolLen = imgLen;
    this._imgPool = new Array(imgLen).fill(null);
    this._imgComplete = this.onImageComplete.bind(this);
    this._imgError = this.onImageError.bind(this);

    //.............................
    //Setup XHR Connection Pool
    this._xhrPoolLen = xhrLen;
    this._xhrPool = new Array(xhrLen);

    let xhr,
      onComplete = this.onXhrComplete.bind(this),
      onError = this.onXhrError.bind(this),
      onAbort = this.onXhrAbort.bind(this),
      onTimeout = this.onXhrTimeout.bind(this);

    for (let i = 0; i < xhrLen; i++) {
      this._xhrPool[i] = xhr = new IXMLHttpRequest();

      xhr.addEventListener("load", onComplete, false);
      xhr.addEventListener("error", onError, false);
      xhr.addEventListener("abort", onAbort, false);
      xhr.addEventListener("timeout", onTimeout, false);
      xhr.inUse = false;
      xhr.activeItem = null;
    }

    //.............................
    if (dlAry !== null) this.loadQueue(dlAry);
  }

  //+++++++++++++++++++++++++++++++++++++++++++++++++
  // Methods
  loadQueue(ary: any) {
    let itm;
    for (itm of ary) this._queue.push(itm);
    return this;
  }

  start() {
    if (this._promise) {
      console.log("Downloader is currently active (promise)");
      return this;
    }
    if (!this._queue.length) {
      console.log("Can not start downloading, queue is empty");
      return this;
    }

    this._promise = new Promise((resolve, reject) => {
      if (this.debug) console.log("Download Promise Starting");

      this._resolve = resolve;
      this._reject = reject;

      this._loadNext();
    });

    return this._promise;
  }
  //endregion

  //+++++++++++++++++++++++++++++++++++++++++++++++++
  // Handle Queue
  _activeCount() {
    let i,
      cnt = 0;
    //Count Active xhr objects
    for (i = 0; i < this._xhrPoolLen; i++) if (this._xhrPool[i].inUse) cnt++;

    //Count Active Image Downloads
    for (i = 0; i < this._imgPoolLen; i++) if (this._imgPool[i] !== null) cnt++;

    return cnt;
  }

  //TODO Need to built some kind of Mulex Lock for handling next item to load from the queue.
  _loadNext() {
    if (this.debug)
      console.log(
        "Load Next : Queue Size ",
        this._queue.length,
        "Active",
        this._activeCount()
      );

    //..................................
    if (this._queue.length === 0 && this._activeCount() === 0) {
      this._finalize(true);
      return;
    }

    //..................................
    //Find all available Xhr Slots that can do downloading.
    let i, q, itm, handler;
    for (i = 0; i < this._xhrPoolLen; i++) {
      if (this._xhrPool[i].inUse) continue;
      if (this._queue.length === 0) break;

      for (q = 0; q < this._queue.length; q++) {
        if (this._queue[q].type == "image") continue;

        itm = this._queue[q];
        this._queue.splice(q, 1);
        if (itm.type === "image") {
          handler = Downloader.Handlers.image;
        } else if (itm.type === "snippet") {
          handler = Downloader.Handlers.snippet;
        } else if (itm.type === "shader") {
          handler = Downloader.Handlers.shader;
        }

        if (!handler) {
          this._finalize(false, "Unknown download handler : " + itm.type);
          return;
        }
        if (itm.type === "snippet") {
          this._startXhr(
            this._xhrPool[i],
            itm,
            Downloader.Handlers.snippet.downloadType
          );
        } else if (itm.type === "shader") {
          this._startXhr(
            this._xhrPool[i],
            itm,
            Downloader.Handlers.shader.downloadType
          );
        }

        break;
      }
    }

    //..................................
    //Find any slot available for image downloads
    for (i = 0; i < this._imgPoolLen; i++) {
      if (this._imgPool[i] !== null) continue;
      if (this._queue.length === 0) break;

      for (q = 0; q < this._queue.length; q++) {
        if (this._queue[q].type !== "image") continue;

        itm = this._queue[q];
        this._queue.splice(q, 1);

        if (itm.type === "image") {
          handler = Downloader.Handlers.image;
        } else if (itm.type === "snippet") {
          handler = Downloader.Handlers.snippet;
        } else if (itm.type === "shader") {
          handler = Downloader.Handlers.shader;
        }
        if (!handler) {
          this._finalize(false, "Unknown download handler : " + itm.type);
          return;
        }

        this._startImg(i, itm);
        break;
      }
    }
  }

  _finalize(isSuccess: boolean, errMsg?: string) {
    //IsActive = false;
    if (this.debug) console.log("Download Finalizer", isSuccess, errMsg);

    if (isSuccess)
      this._resolve(true); //Can pass data with resolve if needed later
    else this._reject(new Error(errMsg));

    this._promise = null;
    this._resolve = null;
    this._reject = null;
  }

  onItemDownloaded(dlItem: any, dlResult: any) {
    if (this.debug) console.log("onItemDownloaded", dlItem.file);

    //...............................
    //When download is done, do any further processing if needed.
    let doSave = true;
    let handler;
    if (dlItem.type === "image") {
      handler = Downloader.Handlers.image;
    } else if (dlItem.type === "snippet") {
      handler = Downloader.Handlers.snippet;
    } else if (dlItem.type === "shader") {
      handler = Downloader.Handlers.shader;
      if (handler.onReady) doSave = handler.onReady(this, dlItem, dlResult);
    }

    //...............................
    //Save Download Data and put in on the complete list
    if (doSave) dlItem.download = dlResult;
    this.complete.push(dlItem);

    //...............................
    //Cleanup and start next download
    this._loadNext();
  }
  //endregion

  //+++++++++++++++++++++++++++++++++++++++++++++++++
  // Handle XHR Connection
  _startXhr(xhr: IXMLHttpRequest, itm: any, type: any) {
    if (this.debug) console.log("======================\nGet File ", itm.file);

    xhr.open("GET", itm.file);
    xhr.inUse = true;
    xhr.responseType = type;
    xhr.activeItem = itm;

    try {
      xhr.send();
    } catch (err) {
      console.log("xhr err", err);
      this._finalize(false, err as string);
    }
  }

  onXhrComplete(e: any) {
    const xhr = e.currentTarget,
      itm = xhr.activeItem;

    if (this.debug) console.log("onXhrComplete", xhr.activeItem.file);

    //...............................
    //If error out if there is no successful html code
    if (xhr.status !== 200) {
      this._finalize(
        false,
        "http status : " + xhr.status + " " + xhr.statusText
      );
      return;
    }

    xhr.inUse = false;
    xhr.activeItem = null;
    this.onItemDownloaded(itm, xhr.response);
  }
  onXhrError(e: any) {
    e.currentTarget.inUse = false;
    this._finalize(false, e);
    console.log("onXhrError");
  }
  onXhrAbort(e: any) {
    e.currentTarget.inUse = false;
    this._finalize(false, e);
    console.log("onXhrAbort");
  }
  onXhrTimeout(e: any) {
    e.currentTarget.inUse = false;
    this._finalize(false, e);
    console.log("onXhrTimeout");
  }
  //endregion

  //+++++++++++++++++++++++++++++++++++++++++++++++++
  // Image Download
  _startImg(idx: any, itm: any) {
    if (this.debug) console.log("======================\nGet Image ", itm.file);

    const img = new EImage();
    this._imgPool[idx] = img;
    img.poolIdx = idx;
    img.activeItem = itm;
    img.onload = this._imgComplete;
    img.onabort = img.onerror = this._imgError;
    img.src = itm.file;
  }

  onImageComplete(e: any) {
    const img = e.currentTarget,
      itm = img.activeItem;

    this._imgPool[img.poolIdx] = null; //Clear out spot for more image downloading.

    delete img.activeItem; //Delete items that are not needed anymore
    delete img.poolIdx;

    this.onItemDownloaded(itm, img); //Complete Download
  }

  onImageError(e: any) {
    this._finalize(false, "Error downloading image");
  }
  //endregion

  static Handlers = {
    //...........................................
    image: {},

    //...........................................
    snippet: { downloadType: "text" },

    //...........................................
    shader: {
      downloadType: "text",
      cache: [], //Cache the snippet files found, so we dont download the same snippet more then once.
      onReady: function (ref: any, itm: any, dl: any) {
        if (ref.debug) console.log("Shader.onReady", dl);

        /*
			  var re		= /#snip ([^\n\r]*)/g,
				  snip	= [],
				  m;
  
			  while(m = re.exec(dl)){
				  if( this.cache.indexOf(m[1]) == -1 ){
					  this.cache.push( m[1] );
					  queueSnippet( m[1] );
					  snip.push( m[1] );
				  }
			  }
  
			  if(snip.length > 0) itm.snippets = snip;
			  */

        return true;
      }
    }
    //...........................................
  };
} //cls

class EImage extends Image {
  poolIdx: any;
  activeItem: any;
  constructor() {
    super();
  }
}
//export default mod;
export default Downloader;
