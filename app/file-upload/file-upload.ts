interface UploadOption {
    formData?: any
    fileVal?: string
    multiple?: boolean
    url?: string
    fileQueued?: Function
    uploadBeforeSend?: Function
    uploadSuccess?: Function
    uploadError?: Function
    uploadComplete?: Function
}

export class FileUpload {
    constructor(id: string, option: UploadOption = {}) {
        Object.assign(this.option, option)
        this.ref = window.document.querySelector(`#${id}`);
        this.init();
        this.initEvent()
    }

    ref: HTMLElement;
    inputRef: HTMLInputElement;
    option: UploadOption = {
        fileVal: 'file',
        fileQueued: () => {
        },
        uploadBeforeSend: () => {
        },
        uploadSuccess: () => {
        },
        uploadError: () => {
        },
        uploadComplete: () => {
        },
    }

    init() {
        this.ref.style.cursor = 'pointer';
        let boxRef = <HTMLDivElement> document.createElement('div');
        boxRef.style.display = 'none';
        this.inputRef = <HTMLInputElement> document.createElement('input');
        this.inputRef.type = 'file';
        this.inputRef.multiple = !!this.option.multiple;
        boxRef.appendChild(this.inputRef);
        this.ref.appendChild(boxRef)
    }

    initEvent() {
        this.inputRef.addEventListener('change', (e: any) => {
            let files = e.target.files;
            this.option.fileQueued(files);
            Array.from(files).every((f) => {
                this.ajaxLoad(f);
                return true;
            })
            this.inputRef.value = null;
        });
        this.ref.addEventListener('click', (e: any) => {
            this.inputRef.click();
        });

        this.ref.addEventListener('dragleave', (e: any) => {
            e.preventDefault();
            e.stopPropagation();
        });

        this.ref.addEventListener('dragenter', (e: any) => {
            e.preventDefault();
            e.stopPropagation();
        });

        this.ref.addEventListener('dragover', (e: any) => {
            e.preventDefault();
            e.stopPropagation();
        });

        this.ref.addEventListener('drop', (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            let files = e.dataTransfer.files
            this.option.fileQueued(files)
            Array.from(files).every((f) => {
                this.ajaxLoad(f);
                return true;
            })
        });
    }

    ajaxLoad(file) {
        if (!this.option.url) return;
        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open('POST', this.option.url);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                try {
                    this.option.uploadSuccess(JSON.parse(xhr.responseText), file)
                } catch (e) {
                    this.option.uploadSuccess(xhr.responseText, file)
                }
            }
        };
        let fd = new FormData();
        fd.append(this.option.fileVal, file, file.name);
        this.option.uploadBeforeSend({file: file}, fd);
        xhr.send(fd)
    }
}

new FileUpload('asd', {
    fileQueued: (files) => {
        console.info(files)
    },
    uploadBeforeSend: (file, data) => {
        data.append('a', 1)
    },
    uploadSuccess: (res, file) => {
        console.info(res);
        document.querySelector('#img').innerHTML = `<img src="${res.result.filePath}">`
    },
    multiple: true,
    url: 'https://aid.zcdsp.com/ws-api/img/qualification'
});
