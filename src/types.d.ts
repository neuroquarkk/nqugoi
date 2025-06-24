export {};

declare global {
    interface GridPosition {
        x: number;
        y: number;
    }

    interface SpeciesCounts {
        [species: number]: number; // how many neighbors belong to each species
    }

    interface GameSettings {
        gridSize: number;
        speciesCount: number;
        wraparound: boolean;
        fps: number;
    }

    interface CellCoordinate {
        x: number;
        y: number;
        species: number; // which species occupies this cell
    }

    // Used for tracking if the simulation was auto paused with visiblity change
    interface Window {
        autopaused?: boolean;
    }
}
