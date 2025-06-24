import { Canvas } from './canvas';
import { Controls } from './controls';
import { Grid } from './grid';
import { Simulation } from './simulation';
import { Utils } from './utils';

export class GameApp {
    public grid: Grid;
    public canvas: Canvas;
    public simulation: Simulation;
    public controls: Controls;
    public selectedSpecies: number;

    // storing references to handlers so it can properly be removed
    private onSpeciesSelected!: EventListener;
    private onResize!: EventListener;
    private onKeydown!: (e: KeyboardEvent) => void;

    constructor() {
        this.selectedSpecies = 1;

        this.grid = new Grid(50, 2, true);
        this.canvas = new Canvas('canvas', this.grid);
        this.simulation = new Simulation(this.grid, this.canvas);
        this.controls = new Controls(this.simulation, this.grid, this.canvas);
        this.setupEventHandlers();

        this.canvas.updateColors();
        this.canvas.render();
        this.updateStats();

        this.grid.randomSeed(0.2);
        this.canvas.render();
        this.updateStats();
    }

    private setupEventHandlers(): void {
        this.canvas.setCellClickHandler(
            (x: number, y: number, isErasing: boolean) => {
                const value = isErasing ? 0 : this.selectedSpecies;
                this.grid.setCell(x, y, value);
                this.canvas.render();
                this.updateStats();
            }
        );

        this.simulation.setStepCallback(() => {
            this.updateStats();
        });

        this.controls.setGridSettingsChangeHandler((settings: GameSettings) => {
            this.updateGridSettings(settings);
        });

        this.controls.setStatsUpdateHandler(() => {
            this.updateStats();
        });

        this.onSpeciesSelected = (e: Event) => {
            const customEvent = e as CustomEvent;
            this.selectedSpecies = customEvent.detail.species;
        };

        this.onResize = () => {
            // slight delay output before re rendering canvas
            setTimeout(() => {
                this.canvas.render();
            }, 100);
        };

        this.onKeydown = (e: KeyboardEvent) => {
            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    const playPauseBtn = Utils.getElement(
                        'playPauseBtn'
                    ) as HTMLButtonElement;
                    if (playPauseBtn) {
                        playPauseBtn.click();
                    }
                    break;

                case 'c':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.grid.clear();
                        this.canvas.render();
                        this.updateStats();
                    }
                    break;

                case 'r':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.grid.randomSeed(0.2);
                        this.canvas.render();
                        this.updateStats();
                    }
                    break;
            }
        };

        document.addEventListener('speciesSelected', this.onSpeciesSelected);
        window.addEventListener('resize', this.onResize);
        document.addEventListener('keydown', this.onKeydown);
    }

    public updateGridSettings(settings: GameSettings): void {
        this.controls.pauseSimulation();
        this.grid = new Grid(
            settings.gridSize,
            settings.speciesCount,
            settings.wraparound
        );

        this.canvas.updateGrid(this.grid);
        this.simulation.updateGrid(this.grid);
        this.controls.updateGrid(this.grid);

        this.simulation.setFPS(settings.fps);
        this.canvas.render();
        this.updateStats();
    }

    public updateStats(): void {
        const generationElement = Utils.getElement('generation');
        const totalCellsElement = Utils.getElement('totalCells');

        if (generationElement) {
            generationElement.textContent = this.grid.generation.toString();
        }

        if (totalCellsElement) {
            totalCellsElement.textContent = this.grid
                .getTotalCells()
                .toString();
        }
    }

    public destroy(): void {
        this.simulation.destroy();

        document.removeEventListener('speciesSelected', this.onSpeciesSelected);
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener('keydown', this.onKeydown);
    }
}
