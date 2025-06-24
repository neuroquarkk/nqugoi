import type { Grid } from './grid';
import { Utils } from './utils';

export class Canvas {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private grid: Grid;
    private cellSize: number;
    private colors: string[];
    private onCellClick?: (x: number, y: number, isErasing: boolean) => void;

    constructor(canvasId: string, grid: Grid) {
        const canvas = Utils.getElement<HTMLCanvasElement>(canvasId);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error(`Missing context for canvas ${canvasId}`);
        }

        this.canvas = canvas;
        this.ctx = ctx;
        this.grid = grid;
        this.cellSize = 0;
        this.colors = [];
        this.updateCellSize();
        this.setupEventListeners();
    }

    public updateGrid(grid: Grid): void {
        this.grid = grid;
        this.updateCellSize();
    }

    private updateCellSize(): void {
        // pixel size per cell based on canvas size and grid size
        this.cellSize = Math.min(
            this.canvas.width / this.grid.size,
            this.canvas.height / this.grid.size
        );
    }

    public updateColors(): void {
        // Index 0 = background, others = species colors
        this.colors = [
            '#000000',
            ...Utils.getSpeciesColors(this.grid.speciesCount),
        ];
    }

    public render(): void {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.grid.size; y++) {
            if (this.grid.cells[y]) {
                for (let x = 0; x < this.grid.size; x++) {
                    const cell = this.grid.cells[y][x];
                    if (cell > 0 && this.colors[cell]) {
                        this.ctx.fillStyle = this.colors[cell];
                        this.ctx.fillRect(
                            x * this.cellSize,
                            y * this.cellSize,
                            this.cellSize,
                            this.cellSize
                        );
                    }
                }
            }
        }

        // Only draw grid lines of cell size is large enough for visiblity
        if (this.grid.size <= 70 && this.cellSize >= 8) {
            this.drawGridLines();
        }
    }

    private drawGridLines(): void {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();

        for (let i = 0; i <= this.grid.size; i++) {
            const pos = i * this.cellSize;

            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.grid.size * this.cellSize);

            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.grid.size * this.cellSize, pos);
        }

        this.ctx.stroke();
    }

    public setCellClickHandler(
        handler: (x: number, y: number, isErasing: boolean) => void
    ): void {
        this.onCellClick = handler;
    }

    private setupEventListeners(): void {
        let isDrawing = false;

        const getGridPos = (e: MouseEvent): GridPosition => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;

            const canvasX = (e.clientX - rect.left) * scaleX;
            const canvasY = (e.clientY - rect.top) * scaleY;

            const x = Math.floor(canvasX / this.cellSize);
            const y = Math.floor(canvasY / this.cellSize);

            return {
                x,
                y,
            };
        };

        const handleCellInteraction = (e: MouseEvent) => {
            const { x, y } = getGridPos(e);
            const isErasing = e.shiftKey;
            if (this.onCellClick) {
                this.onCellClick(x, y, isErasing);
            }
        };

        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDrawing = true;
            handleCellInteraction(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            handleCellInteraction(e);
        });

        this.canvas.addEventListener('mouseup', () => {
            isDrawing = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            isDrawing = false;
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // prevent right click menu
        });

        // Touch support (mobile)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDrawing = true;
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                shiftKey: false,
            });
            handleCellInteraction(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!isDrawing) return;

            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
            });
            handleCellInteraction(mouseEvent);
        });

        this.canvas.addEventListener('touchend', () => {
            isDrawing = false;
        });
    }
}
