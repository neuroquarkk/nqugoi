import { Utils } from './utils';

export class Grid {
    public readonly size: number;
    public speciesCount: number;
    public readonly wraparound: boolean;
    public cells: number[][];
    public generation: number;

    constructor(
        size: number,
        speciesCount: number,
        wraparound: boolean = true
    ) {
        this.size = Utils.ensurePositiveInteger(size, 100);
        this.speciesCount = Utils.ensurePositiveInteger(speciesCount, 2);
        this.wraparound = wraparound;
        this.generation = 0;
        this.cells = this.createEmptyGrid();
    }

    private createEmptyGrid(): number[][] {
        const grid: number[][] = [];
        for (let i = 0; i < this.size; i++) {
            grid[i] = new Array(this.size).fill(0);
        }
        return grid;
    }

    public getCell(x: number, y: number): number {
        // Adjust coordinates for wraparound behavior
        if (this.wraparound) {
            x = ((x % this.size) + this.size) % this.size;
            y = ((y % this.size) + this.size) % this.size;
        } else if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return 0;
        }

        // Fallback to 0 for out of bounds/missing cells
        return this.cells[y]?.[x] ?? 0;
    }

    public setCell(x: number, y: number, value: number): void {
        if (
            x >= 0 &&
            x < this.size &&
            y >= 0 &&
            y < this.size &&
            this.cells[y]
        ) {
            this.cells[y][x] = value;
        }
    }

    public getNeighbors(x: number, y: number): number[] {
        const neighbors: number[] = [];

        // Check 8 surrounding cells
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;

                const cell = this.getCell(x + dx, y + dy);
                if (cell > 0) neighbors.push(cell);
            }
        }

        return neighbors;
    }

    private getMajoritySpecies(neighbors: number[]): number {
        if (neighbors.length === 0) return 1;

        const counts: { [speices: number]: number } = {};
        neighbors.forEach((species) => {
            counts[species] = (counts[species] || 0) + 1;
        });

        let maxCount = 0;
        let majoritySpecies: number[] = [];

        for (const [species, count] of Object.entries(counts)) {
            const speciesNum = parseInt(species);
            if (isNaN(speciesNum)) continue;

            if (count > maxCount) {
                maxCount = count;
                majoritySpecies = [speciesNum];
            } else if (count === maxCount) {
                majoritySpecies.push(speciesNum);
            }
        }

        return majoritySpecies.length > 0
            ? Utils.getRandomChoice(majoritySpecies)
            : 1;
    }

    public step(): void {
        const newGrid = this.createEmptyGrid();

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const currentCell = this.getCell(x, y);
                const neighbors = this.getNeighbors(x, y);
                const neighborCount = neighbors.length;

                // Apply Game of Immigration rules
                if (currentCell > 0) {
                    if (neighborCount === 2 || neighborCount === 3) {
                        newGrid[y][x] = currentCell;
                    }
                } else if (neighborCount === 3) {
                    newGrid[y][x] = this.getMajoritySpecies(neighbors);
                }
            }
        }
        this.cells = newGrid;
        this.generation++;
    }

    public clear(): void {
        this.cells = this.createEmptyGrid();
        this.generation = 0;
    }

    public randomSeed(density: number = 0.3): void {
        this.clear();

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (Math.random() < density) {
                    this.cells[y][x] = Utils.getRandomInt(1, this.speciesCount);
                }
            }
        }
    }

    public getTotalCells(): number {
        let count = 0;

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.cells[y][x] > 0) count++;
            }
        }

        return count;
    }

    public getSpeciesCounts(): { [species: number]: number } {
        const counts: { [species: number]: number } = {};

        for (let i = 1; i <= this.speciesCount; i++) {
            counts[i] = 0;
        }

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = this.cells[y][x];
                if (cell > 0) {
                    counts[cell] = (counts[cell] || 0) + 1;
                }
            }
        }

        return counts;
    }
}
