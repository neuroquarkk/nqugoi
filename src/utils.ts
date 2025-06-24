export class Utils {
    private static cachedColors: string[] = [];

    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomChoice<T>(array: T[]): T {
        if (array.length === 0) {
            throw new Error('Cannot choose from empty array');
        }
        return array[Math.floor(Math.random() * array.length)];
    }

    static getSpeciesColors(count: number): string[] {
        const baseColors: string[] = [
            '#ff6b6b',
            '#4ecdc4',
            '#96ceb4',
            '#feca57',
            '#ff9ff3',
            '#54a0ff',
            '#00d2d3',
            '#ff9f43',
        ];
        const needed = count - baseColors.length;

        // Generating unique colors until we have enough
        while (Utils.cachedColors.length < needed) {
            const h = Math.floor(Math.random() * 360);
            const s = 70 + Math.floor(Math.random() * 20);
            const l = 50 + Math.floor(Math.random() * 10);

            const color = Utils.hslToHex(h, s, l);

            if (
                !baseColors.includes(color) &&
                !Utils.cachedColors.includes(color)
            ) {
                Utils.cachedColors.push(color);
            }
        }

        return [...baseColors, ...Utils.cachedColors].slice(0, count);
    }

    // Convert HSL to HEX
    private static hslToHex(h: number, s: number, l: number): string {
        const hDecimal = l / 100;
        const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
        const f = (n: number): string => {
            const k = (n + h / 30) % 12;
            const color =
                hDecimal - a * a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

            return Math.round(255 * color)
                .toString(16)
                .padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    static isValidInteger(value: any): value is number {
        return typeof value === 'number' && Number.isInteger(value);
    }

    static ensurePositiveInteger(value: number, fallback: number = 1): number {
        if (!this.isValidInteger(value) || value <= 0) {
            return fallback;
        }
        return value;
    }

    static getElement<T extends HTMLElement>(id: string): T {
        const element = document.getElementById(id) as T;
        if (!element) {
            throw new Error(`Element with id ${id} not found`);
        }
        return element;
    }
}
