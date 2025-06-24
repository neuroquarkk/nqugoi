import { GameApp } from './gameApp';

let gameApp: GameApp | null = null;

document.addEventListener('DOMContentLoaded', () => {
    gameApp = new GameApp();
});

window.addEventListener('beforeunload', () => {
    if (gameApp) gameApp.destroy();
});

document.addEventListener('visibilitychange', () => {
    if (gameApp && gameApp.simulation) {
        if (document.hidden && gameApp.simulation.running) {
            gameApp.simulation.pause();
            window.autopaused = true;
        } else if (!document.hidden && (window as any).autopaused) {
            gameApp.simulation.start();
            window.autopaused = false;
        }
    }
});
