import type { Canvas } from './canvas';
import type { Grid } from './grid';

export class Simulation {
    private grid: Grid;
    private canvas: Canvas;
    private isRunning: boolean;
    private fps: number;
    private lastFrameTime: number;
    private animationId: number | null;
    private onStep?: () => void;

    constructor(grid: Grid, canvas: Canvas) {
        this.canvas = canvas;
        this.grid = grid;
        this.isRunning = false;
        this.fps = 10;
        this.lastFrameTime = 0;
        this.animationId = null;
    }

    public get running(): boolean {
        return this.isRunning;
    }

    public get currentFPS(): number {
        return this.fps;
    }

    public setStepCallback(callback: () => void): void {
        this.onStep = callback;
    }

    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.loop();
    }

    public pause(): void {
        this.isRunning = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId!);
            this.animationId = null;
        }
    }

    public step(): void {
        this.grid.step();
        this.canvas.render();
        if (this.onStep) {
            this.onStep();
        }
    }

    public setFPS(fps: number): void {
        this.fps = fps;
    }

    public updateGrid(grid: Grid): void {
        this.grid = grid;
    }

    // Recursive animation loop
    private loop = (): void => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        const frameInterval = 1000 / this.fps;

        // only run step if enough time passed for desired fps
        if (deltaTime >= frameInterval) {
            this.step();
            this.lastFrameTime = currentTime - (deltaTime % frameInterval);
        }

        this.animationId = requestAnimationFrame(this.loop);
    };

    public destroy(): void {
        this.pause();
    }
}
