import ready from 'domready';
import { tns } from "../../node_modules/tiny-slider/src/tiny-slider"
import '../scss/index.scss';

class Canvas {
    constructor(el) {
        this.el = el;
        this.ctx = el.getContext('2d');
        this.lineWidth = 8;
        this.color = '#ff0000';
        this.ongoingTouches = [];
        this.isDrawing = false;
        this.x = 0;
        this.y = 0;
        this.previous = null;

        this.setSizes();

        el.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
        el.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
        el.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
        el.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), false);

        el.addEventListener('mousedown', (e) => this.handleMouseDown(e), false);
        el.addEventListener('mousemove', (e) => this.handleMouseMove(e), false);
        el.addEventListener('mouseup', (e) => this.handleMouseUp(e), false);

        window.addEventListener('resize', () => this.setSizes(), false);
    }
    handleTouchStart(e) {
        e.preventDefault();
        this.previous = this.ctx.getImageData(0, 0, this.el.width, this.el.height);
        const touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            this.ongoingTouches.push(this.copyTouch(touches[i]))
            this.ctx.beginPath();
            this.ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
    handleTouchMove(e) {
        e.preventDefault();
        const touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            const idx = this.ongoingTouchIndexById(touches[i].identifier)
            if (idx >= 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.ongoingTouches[idx].pageX, this.ongoingTouches[idx].pageY);
                this.ctx.lineTo(touches[i].pageX, touches[i].pageY);
                this.ctx.lineWidth = this.lineWidth;
                this.ctx.strokeStyle = this.color;
                this.ctx.stroke();
                this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i]));
            }
        }
    }
    handleTouchEnd(e) {
        e.preventDefault();
        const touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            const idx = this.ongoingTouchIndexById(touches[i].identifier)
            if (idx >= 0) {
                this.ctx.lineWidth = this.lineWidth;
                this.ctx.fillStyle = this.color;
                this.ctx.beginPath();
                this.ctx.moveTo(this.ongoingTouches[idx].pageX, this.ongoingTouches[idx].pageY);
                this.ctx.lineTo(touches[i].pageX, touches[i].pageY);
                this.ongoingTouches.splice(idx, 1);
            }
        }
    }
    handleTouchCancel(e) {
        e.preventDefault();
        const touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            const idx = this.ongoingTouchIndexById(touches[i].identifier)
            this.ongoingTouches.splice(idx, 1);
        }
    }
    copyTouch({ identifier, pageX, pageY }) {
        return { identifier, pageX, pageY };
    }
    ongoingTouchIndexById(idToFind) {
        for (let i = 0; i < this.ongoingTouches.length; i++) {
            const id = this.ongoingTouches[i].identifier;
            if (id == idToFind) {
                return i;
            }
        }
        return -1;
    }
    handleMouseDown(e) {
        this.previous = this.ctx.getImageData(0, 0, this.el.width, this.el.height);
        this.x = e.offsetX;
        this.y = e.offsetY;
        this.isDrawing = true;
    }
    handleMouseMove(e) {
        if (this.isDrawing === true) {
            this.drawLine(this.ctx, this.x, this.y, e.offsetX, e.offsetY);
            this.x = e.offsetX;
            this.y = e.offsetY;
        }
    }
    handleMouseUp(e) {
        if (this.isDrawing === true) {
            this.drawLine(this.ctx, this.x, this.y, e.offsetX, e.offsetY);
            this.x = 0;
            this.y = 0;
            this.isDrawing = false;
        }
    }
    drawLine(context, x1, y1, x2, y2) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    }
    setSizes() {
        const rect = document.body.getBoundingClientRect();
        this.el.width = rect.width;
        this.el.height = rect.height;
    }
}

class App {
    constructor() {
        this.$toggleFullScreenBtn = document.querySelector('.btn_togglefullscreen');
        this.$undoBtns = document.querySelectorAll('.btn_undo');
        this.$clearBtns = document.querySelectorAll('.btn_clear');
        this.$slider = document.querySelector('.slider');
        this.w = 0;
        this.h = 0;
        this.drawings = [];

        this.setSizes();

        this.$toggleFullScreenBtn.addEventListener('click', () => {
            this.toggleFullScreen();
        });

        this.$clearBtns.forEach($btn => {
            $btn.addEventListener('click', (e) => {
                const slide = e.currentTarget.parentNode;
                const canvas = slide.querySelector('canvas');
                this.clear(canvas);
            });
        });

        this.$undoBtns.forEach($btn => {
            $btn.addEventListener('click', (e) => {
                const slide = e.currentTarget.parentNode;
                const canvas = slide.querySelector('canvas');
                this.undo(canvas);
            });
        });

        window.addEventListener('resize', () => this.setSizes(), false);
    }
    clear(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    undo(canvas) {
        const ctx = canvas.getContext('2d');
        this.drawings.map(drawing => {
            if (drawing.el === canvas) {
                ctx.putImageData(drawing.previous, 0, 0);
            }
        });
    }
    toggleFullScreen() {
        const doc = window.document;
        const docEl = doc.documentElement;
      
        const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
      
        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
          requestFullScreen.call(docEl);
        }
        else {
          cancelFullScreen.call(doc);
        }
    }
    handleUndoClick() {
        
    }
    handleClearClick() {
        this.$clearBtns.forEach($btn => {
            $btn
        });
    }
    initCarousel() {
        let slider = tns({
            container: this.$slider,
            items: 1,
            nav: false,
            autoplay: false,
            touch: false,
            rewind: true,
            onInit: el => {
                el.prevButton.style.height = `${this.h - 200}px`;
                el.nextButton.style.height = `${this.h - 200}px`;
                Array.from(el.slideItems).forEach(slide => {
                    const $canvas = slide.querySelector('canvas');
                    this.drawings.push(new Canvas($canvas));
                })
            }
        });
    }
    setSizes() {
        const rect = document.body.getBoundingClientRect();
        this.w = rect.width;
        this.h = rect.height;
    }
    init() {
        this.initCarousel();
    } 
}

ready(() => {
    window.app = new App();
    window.app.init();
});