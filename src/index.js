/**
 * Build styles
 */
require('./index.css').toString();

const Url = require('url-parse');
/**
 * SimpleImage Tool for the Editor.js
 * Works only with pasted image URLs and requires no server-side uploader.
 *
 * @typedef {object} SimpleImageData
 * @description Tool's input and output data format
 * @property {string} url — image URL
 * @property {string} caption — image caption

 * @property {boolean} withBackground - should image be rendered with background
 * @property {boolean} stretched - should image be stretched to full width of container
 */
class SimpleImage {
    /**
     * Render plugin`s main Element and fill it with saved data
     *
     * @param {{data: SimpleImageData, config: object, api: object}}
     *   data — previously saved data
     *   config - user config for Tool
     *   api - Editor.js API
     */
    constructor({ data, config, api }) {
        /**
         * Editor.js API
         */
        this.api = api;

        /**
         * When block is only constructing,
         * current block points to previous block.
         * So real block index will be +1 after rendering
         * @todo place it at the `rendered` event hook to get real block index without +1;
         * @type {number}
         */
        this.blockIndex = this.api.blocks.getCurrentBlockIndex() + 1;

        /**
         * Styles
         */
        this.CSS = {
            baseClass: this.api.styles.block,
            loading: this.api.styles.loader,
            input: this.api.styles.input,
            settingsButton: this.api.styles.settingsButton,
            settingsButtonActive: this.api.styles.settingsButtonActive,

            /**
             * Tool's classes
             */
            wrapper: 'cdx-simple-image',
            imageHolder: 'cdx-simple-image__picture',
            caption: 'cdx-simple-image__caption',
            quote: "cdx-simple-image__picture--quote"
        };

        /**
         * Nodes cache
         */
        // this.nodes = {
        //   wrapper: null,
        //   imageHolder: null,
        //   image: null,
        //   caption: null
        // };

        this.wrapper = {
            block: document.createElement('div'),
            renderSettings: document.createElement('div')
        };

        /**
         * Tool's initial data
         * @todo use ai to create caption
         */
        this.data = {
            // init: 0,
            url: data.url || '',
            caption: data.caption || '',
            quote: data.quote !== undefined ? data.quote : false,
            withBackground: data.withBackground !== undefined ? data.withBackground : false,
            stretched: data.stretched !== undefined ? data.stretched : false,
        };


        /**
         * Available Image settings
         */
        this.settings = [{
                name: "quote",
                icon: '<svg data-svg="quote-right" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M17.27,7.79 C17.27,9.45 16.97,10.43 15.99,12.02 C14.98,13.64 13,15.23 11.56,15.97 L11.1,15.08 C12.34,14.2 13.14,13.51 14.02,11.82 C14.27,11.34 14.41,10.92 14.49,10.54 C14.3,10.58 14.09,10.6 13.88,10.6 C12.06,10.6 10.59,9.12 10.59,7.3 C10.59,5.48 12.06,4 13.88,4 C15.39,4 16.67,5.02 17.05,6.42 C17.19,6.82 17.27,7.27 17.27,7.79 L17.27,7.79 Z"></path><path d="M8.68,7.79 C8.68,9.45 8.38,10.43 7.4,12.02 C6.39,13.64 4.41,15.23 2.97,15.97 L2.51,15.08 C3.75,14.2 4.55,13.51 5.43,11.82 C5.68,11.34 5.82,10.92 5.9,10.54 C5.71,10.58 5.5,10.6 5.29,10.6 C3.47,10.6 2,9.12 2,7.3 C2,5.48 3.47,4 5.29,4 C6.8,4 8.08,5.02 8.46,6.42 C8.6,6.82 8.68,7.27 8.68,7.79 L8.68,7.79 Z"></path></svg>',
                action: (e) => {
                    this.wrapper.block.classList.toggle(this.CSS.quote);
                    this.api.blocks.stretchBlock(this.blockIndex, !!this.data.stretched);
                }
            },
            // {
            //     name: "check",
            //     icon: '<svg data-svg="check" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" points="4,10 8,15 17,4" stroke="#000" stroke-width="1.1"></polyline></svg>',
            //     action: (e) => {

            //     }
            // },
            // {
            //     //接到 其他组件
            //     name: "output",
            //     icon: '<svg data-svg="check" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" points="4,10 8,15 17,4" stroke="#000" stroke-width="1.1"></polyline></svg>',

            //     action: (e) => {
            //         // this.api.blocks.delete(this.index);
            //         this.api.blocks.insert(this.config.output, {
            //             url: base64,
            //             quote: true,
            //             caption: this._getTime(currentTime).num

            //         });
            //     }
            // }

            // {
            //     name: 'stretched',
            //     icon: `<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.512 1.511L4.084 3.787h9.606l-1.85-1.85a1.069 1.069 0 1 1 1.512-1.51l3.792 3.791a1.069 1.069 0 0 1-.475 1.788L13.514 9.16a1.125 1.125 0 0 1-1.59-1.591l1.644-1.644z"/></svg>`,
            //     action: (e) => {
            //         this.api.blocks.stretchBlock(this.blockIndex, !!this.data.stretched);
            //     }
            // },
            // {
            //     name: 'withBackground',
            //     icon: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.043 8.265l3.183-3.183h-2.924L4.75 10.636v2.923l4.15-4.15v2.351l-2.158 2.159H8.9v2.137H4.7c-1.215 0-2.2-.936-2.2-2.09v-8.93c0-1.154.985-2.09 2.2-2.09h10.663l.033-.033.034.034c1.178.04 2.12.96 2.12 2.089v3.23H15.3V5.359l-2.906 2.906h-2.35zM7.951 5.082H4.75v3.201l3.201-3.2zm5.099 7.078v3.04h4.15v-3.04h-4.15zm-1.1-2.137h6.35c.635 0 1.15.489 1.15 1.092v5.13c0 .603-.515 1.092-1.15 1.092h-6.35c-.635 0-1.15-.489-1.15-1.092v-5.13c0-.603.515-1.092 1.15-1.092z"/></svg>`
            // },
        ];
    }

    // static get toolbox() {
    //   return {
    //     title: 'Image',
    //     icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    //   };
    // }


    /**
     * Creates a Block:
     *  1) Show preloader
     *  2) Start to load an image
     *  3) After loading, append image and caption input
     * @public
     */
    render() {

        this.wrapper.block = this._make('div', [this.CSS.baseClass, this.CSS.wrapper]);

        this._createImage();

        return this.wrapper.block;
    }

    _createImage() {
            let loader = this._make('div', this.CSS.loading),
                imageHolder = this._make('div', this.CSS.imageHolder),
                image = this._make('img'),
                caption = this._make('div', [this.CSS.input, this.CSS.caption], {
                    contentEditable: 'true',
                    innerHTML: this.data.caption || ''
                });

            caption.dataset.placeholder = '输入图片描述';


            this.api.listeners.on(this.wrapper.block, 'click', (e) => {
                caption.focus();
            });

            this.api.listeners.on(caption, 'paste', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                const plainData = e.clipboardData.getData('text/plain');
                // let htmlData = e.clipboardData.getData('text/html');
                //console.log(plainData)
                if (plainData) {
                    caption.innerText = plainData;
                    this.data.caption = plainData;
                }
            }, false);

            if (!this.data.url) return;

            this.wrapper.block.appendChild(loader);

            if (this.data.url) {
                image.src = this.data.url;
            };

            if (this.wrapper.block.classList.contains(this.CSS.quote) != this.data.quote) {
                this.wrapper.block.classList.toggle(this.CSS.quote);
            };

            image.onload = () => {
                // console.log('onload');
                this.wrapper.block.classList.remove(this.CSS.loading);
                imageHolder.appendChild(image);
                this.wrapper.block.appendChild(imageHolder);
                this.wrapper.block.appendChild(caption);
                loader.remove();
                // this._acceptTuneView();
            };

            image.onerror = (e) => {
                // @todo use api.Notifies.show() to show error notification
                console.log('Failed to load an image', e);
                this.wrapper.block.classList.remove(this.CSS.loading);
                loader.remove();

                this.api.blocks.delete(this.index);
                this.api.blocks.insert("paragraph", {
                    text: this.data.text
                }, null, this.index, false);
                // this.api.caret.focus(false);

            };
        }
        /**
         * @public
         * Saving method
         * @param {Element} blockContent - Tool's wrapper
         * @return {SimpleImageData}
         */
    save(blockContent) {
        let image = blockContent.querySelector('img'),
            caption = blockContent.querySelector('.' + this.CSS.input);

        if (!image) {
            return this.data;
        }

        return Object.assign(this.data, {
            url: image.src,
            caption: caption.innerHTML
        });
    }

    /**
     * Sanitizer rules
     */
    static get sanitize() {
        return {
            url: {},
            // withBackground: {},
            // stretched: {},
            quote: {},
            caption: {
                br: true,
            },
        };
    }


    /**
     * Read pasted image and convert it to base64
     *
     * @static
     * @param {File} file
     * @returns {Promise<SimpleImageData>}
     */
    _onDropHandler(file) {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        return new Promise(resolve => {
            reader.onload = (event) => {
                // console.log('_onDropHandler',event)
                resolve({
                    url: event.target.result,
                    //文件名的处理 @todo ai
                    caption: this._createCaption(file.name)
                });
            };
        });
    }

    /**
     * On paste callback that is fired from Editor.
     *
     * @param {PasteEvent} event - event with pasted config
     */
    onPaste(event) {
        //console.log('paste--', event)
        switch (event.type) {
            case 'tag':
                if (event.detail.tagName == "IMG") {
                    const img = event.detail.data;
                    let caption = img.src;

                    if (!!caption.match(/data\:image\/.*\;base64\,/ig) || !!caption.match("blob:http")) {
                        caption = "";

                    } else {
                        let url = new Url(caption);
                        captionText = url.pathname.split("/")[url.pathname.split("/").length - 1]
                    }
                    //console.log(img.src)

                    // if (img.src.match(/data\:image\/.*\;base64\,/ig)) {
                    //     console.log(window.URL.createObjectURL(this.base64ToBlob(img.src)))
                    //         //img.src = ;
                    // }

                    this.data = {
                        url: img.src,
                        caption: this._createCaption(caption),
                        quote: false
                            //withBackground:true
                    };
                    this._createImage();
                };
                // else if (['h1', 'h2', 'h3', 'h4', 'p'].includes(event.detail.tagName)) {
                //     this.data.caption = event.detail.data;
                // }


                break;

            case 'pattern':
                const { data: text } = event.detail;

                let url = ("http" + text.split("http")[1]).trim();
                let captionText = new Url(url);
                captionText = captionText.pathname.split("/")[captionText.pathname.split("/").length - 1]

                let that = this;
                this.imgurl2base64(url).then(base64 => {
                    that.data = {
                        url: base64,
                        caption: this._createCaption(captionText),
                        text: text,
                        quote: false,
                    };
                    that._createImage();
                });

                break;

            case 'file':
                const { file } = event.detail;

                this._onDropHandler(file)
                    .then(data => {
                        //console.log(data.url);
                        data.quote = false;
                        this.data = data;
                        this._createImage();
                    });

                break;
        }
    }

    // /**
    //  * Returns image data
    //  * @return {SimpleImageData}
    //  */
    // get data() {
    //     return Object.assign(this.data, { test: 22 });
    // }

    // // /**
    // //  * Set image data and update the view
    // //  *
    // //  * @param {SimpleImageData} data
    // //  */
    // set data(data) {
    //     this._data = Object.assign({}, this.data, data);
    //     //console.log('data',data)
    //     if (this.nodes.image) {
    //         this.nodes.image.src = this.data.url;
    //     }

    //     if (this.nodes.caption) {
    //         this.nodes.caption.innerText = this.data.caption;
    //     }
    // }

    /**
     * Specify paste substitutes
     * old /https?:\/\/\S+\.(gif|jpe?g|tiff|png)$/i
     * @see {@link ../../../docs/tools.md#paste-handling}
     * @public
     */
    static get pasteConfig() {

        return {
            patterns: {
                image: /.*https?:\/\/\S+/i
            },
            tags: ['img'],
            files: {
                mimeTypes: ['image/*']
            },
        };
    }

    /**
     * Makes buttons with tunes: add background, add border, stretch image
     * @return {HTMLDivElement}
     */
    renderSettings() {
        this.wrapper.settings = document.createElement('div');

        this.settings.forEach(tune => {
            let el = document.createElement('div');

            el.classList.add(this.CSS.settingsButton);
            el.innerHTML = tune.icon;

            el.addEventListener('click', (e) => {
                e.preventDefault();
                el.classList.toggle(this.CSS.settingsButtonActive);
                tune.action(e);

                // console.log('click--', tune.name);
                // this._toggleTune(tune.name);

            });

            //el.classList.toggle(this.CSS.settingsButtonActive, this.data[tune.name]);

            this.wrapper.settings.appendChild(el);
        });
        return this.wrapper.settings;
    };

    /**
     * 生成图片描述caption
     * @param {String} caption 
     * @returns {String}
     */
    _createCaption(caption) {
        caption = caption.replace(/\..*/i, "");
        return caption;
    }


    /**
     * Helper for making Elements with attributes
     *
     * @param  {string} tagName           - new Element tag name
     * @param  {array|string} classNames  - list or name of CSS classname(s)
     * @param  {Object} attributes        - any attributes
     * @return {Element}
     */
    _make(tagName, classNames = null, attributes = {}) {
        let el = document.createElement(tagName);

        if (Array.isArray(classNames)) {
            el.classList.add(...classNames);
        } else if (classNames) {
            el.classList.add(classNames);
        }

        for (let attrName in attributes) {
            el[attrName] = attributes[attrName];
        }

        return el;
    }

    //url转base64
    imgurl2base64(imgurl) {
        if (!imgurl || (imgurl && !imgurl.match("http"))) return

        return new Promise((resolve, reject) => {
            fetch(imgurl, {
                method: 'get',
                responseType: 'blob'
            }).then(res => {
                return res.blob();
            }).then(blob => {
                //console.log(blob)
                const fileReader = new FileReader();
                fileReader.onload = (e) => {
                    resolve(e.target.result);
                };
                // readAsDataURL
                fileReader.readAsDataURL(blob);
                fileReader.onerror = () => {
                    reject(new Error('blobToBase64 error'));
                };
            });
        });
    }

    base64ToBlob({ b64data = '', contentType = '', sliceSize = 512 } = {}) {
        return new Promise((resolve, reject) => {
            // 使用 atob() 方法将数据解码
            let byteCharacters = atob(b64data);
            let byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                let slice = byteCharacters.slice(offset, offset + sliceSize);
                let byteNumbers = [];
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers.push(slice.charCodeAt(i));
                }
                // 8 位无符号整数值的类型化数组。内容将初始化为 0。
                // 如果无法分配请求数目的字节，则将引发异常。
                byteArrays.push(new Uint8Array(byteNumbers));
            }
            let result = new Blob(byteArrays, {
                type: contentType
            })
            result = Object.assign(result, {
                // jartto: 这里一定要处理一下 URL.createObjectURL
                preview: URL.createObjectURL(result),
                name: `图片示例.png`
            });
            resolve(result)
        })
    }

}

module.exports = SimpleImage;