import type { Canvas } from './canvas';
import type { Grid } from './grid';
import type { Simulation } from './simulation';
import { Utils } from './utils';

export class Controls {
    private simulation: Simulation;
    private grid: Grid;
    private canvas: Canvas;
    private onGridSettingsChange?: (settings: GameSettings) => void;
    private onStatsUpdate?: () => void;

    constructor(simulation: Simulation, grid: Grid, canvas: Canvas) {
        this.simulation = simulation;
        this.grid = grid;
        this.canvas = canvas;
        this.setupEventListeners();
        this.updateSpeciesColors();
    }

    public updateGrid(grid: Grid): void {
        this.grid = grid;
        this.updateSpeciesColors();
    }

    public setGridSettingsChangeHandler(
        handler: (settings: GameSettings) => void
    ): void {
        this.onGridSettingsChange = handler;
    }

    public setStatsUpdateHandler(handler: () => void): void {
        this.onStatsUpdate = handler;
    }

    private setupEventListeners(): void {
        // Hook up core control buttons
        Utils.getElement<HTMLButtonElement>('playPauseBtn').addEventListener(
            'click',
            () => this.toggleSimulation()
        );

        Utils.getElement<HTMLButtonElement>('stepBtn').addEventListener(
            'click',
            () => this.stepSimulation()
        );

        Utils.getElement<HTMLButtonElement>('clearBtn').addEventListener(
            'click',
            () => this.clearGrid()
        );

        Utils.getElement<HTMLButtonElement>('randomSeedBtn').addEventListener(
            'click',
            () => this.randomSeed()
        );

        // Fps slider controls simulation speed
        const fpsSlider = Utils.getElement<HTMLInputElement>('fpsSlider');
        const fpsValue = Utils.getElement<HTMLSpanElement>('fpsValue');

        fpsSlider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const fps = parseInt(target.value);
            if (!isNaN(fps)) {
                this.simulation.setFPS(fps);
                fpsValue.textContent = fps.toString();
            }
        });

        // Apply grid changes (size, species, wraparound)
        Utils.getElement<HTMLButtonElement>('applyGridBtn').addEventListener(
            'click',
            () => this.applyGridSettings()
        );
    }

    private toggleSimulation(): void {
        const playPauseBtn =
            Utils.getElement<HTMLButtonElement>('playPauseBtn');

        if (this.simulation.running) {
            this.simulation.pause();
            playPauseBtn.textContent = 'Start';
            playPauseBtn.classList.remove('active');
        } else {
            this.simulation.start();
            playPauseBtn.textContent = 'Pause';
            playPauseBtn.classList.add('active');
        }
    }

    private stepSimulation(): void {
        this.simulation.step();
        if (this.onStatsUpdate) {
            this.onStatsUpdate();
        }
    }

    private clearGrid(): void {
        this.grid.clear();
        this.canvas.render();
        if (this.onStatsUpdate) {
            this.onStatsUpdate();
        }
    }

    private randomSeed(): void {
        const speciesInput = Utils.getElement<HTMLInputElement>('speciesCount');
        const count = parseInt(speciesInput.value, 10);

        if (isNaN(count)) return;

        this.grid.speciesCount = count;

        this.updateSpeciesColors();
        this.canvas.updateColors();
        this.grid.randomSeed(0.2);
        this.canvas.render();
        if (this.onStatsUpdate) {
            this.onStatsUpdate();
        }
    }

    private applyGridSettings(): void {
        const gridSizeInput = Utils.getElement<HTMLInputElement>('gridSize');
        const speciesCountInput =
            Utils.getElement<HTMLInputElement>('speciesCount');
        const wraparoundInput =
            Utils.getElement<HTMLInputElement>('wraparound');

        const size = parseInt(gridSizeInput.value);
        const count = parseInt(speciesCountInput.value);
        const wrap = wraparoundInput.checked;

        if (isNaN(size) || isNaN(count)) {
            console.error('Invalid grid settings');
            return;
        }

        const settings: GameSettings = {
            gridSize: size,
            speciesCount: count,
            wraparound: wrap,
            fps: this.simulation.currentFPS,
        };

        if (this.onGridSettingsChange) {
            this.onGridSettingsChange(settings);
        }
    }

    public updateSpeciesColors(): void {
        const container = Utils.getElement<HTMLDivElement>('speciesColors');
        container.innerHTML = '';

        const colors = Utils.getSpeciesColors(this.grid.speciesCount);
        colors.forEach((color: string, idx: number) => {
            const colorDiv = document.createElement('div');
            colorDiv.classList = 'species-color';
            colorDiv.style.backgroundColor = color;
            colorDiv.title = `Species ${idx + 1}`;

            colorDiv.addEventListener('click', () => {
                this.selectSpecies(idx + 1, colorDiv);
            });

            container.appendChild(colorDiv);
        });

        const firstColor = container.firstChild as HTMLElement;
        if (firstColor) {
            this.selectSpecies(1, firstColor);
        }
    }

    private selectSpecies(species: number, colorDiv: HTMLElement): void {
        document
            .querySelectorAll('.species-color')
            .forEach((div) => div.classList.remove('selected'));

        colorDiv.classList.add('selected');

        const event = new CustomEvent('speciesSelected', {
            detail: { species },
        });

        document.dispatchEvent(event);
    }

    public pauseSimulation(): void {
        if (this.simulation.running) {
            this.simulation.pause();
            const playPauseBtn =
                Utils.getElement<HTMLButtonElement>('playPauseBtn');
            playPauseBtn.textContent = 'Start';
            playPauseBtn.classList.remove('active');
        }
    }
}
