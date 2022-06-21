"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const printLine = (text, breakLine = true) => {
    process.stdout.write(text + (breakLine ? '\n' : ''));
};
const readLine = () => __awaiter(void 0, void 0, void 0, function* () {
    const input = yield new Promise((resolve) => {
        process.stdin.once('data', (data) => resolve(data.toString()));
    });
    return input.trim();
});
const promptInput = (text) => __awaiter(void 0, void 0, void 0, function* () {
    printLine(`\n${text}\n> `, false);
    return readLine();
});
const promptSelect = (text, values) => __awaiter(void 0, void 0, void 0, function* () {
    printLine(`\n${text}`);
    values.forEach((value) => {
        printLine(`- ${value}`);
    });
    printLine(`> `, false);
    const input = (yield readLine());
    if (values.includes(input)) {
        return input;
    }
    else {
        return promptSelect(text, values);
    }
});
/*** Game抽象クラス ***/
class Game {
}
/*** GameProcedureクラスの型宣言 ***/
const nextActions = ['play again', 'change game', 'exit'];
const gameTitles = ['hit and blow', 'janken'];
/*** GameProcedureクラス ***/
class GameProcedure {
    constructor(gameStore) {
        this.gameStore = gameStore;
        this.currentGameTitle = '';
        this.currentGame = null;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.select();
            yield this.play();
        });
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.currentGame)
                throw new Error('ゲームが選択されていません');
            printLine(`===\n${this.currentGameTitle}を開始します\n===`);
            yield this.currentGame.setting();
            yield this.currentGame.play();
            this.currentGame.end();
            const action = yield promptSelect('ゲームを続けますか？', nextActions);
            if (action === 'play again') {
                yield this.play();
            }
            else if (action === 'change game') {
                yield this.select();
                yield this.play();
            }
            else if (action === 'exit') {
                this.end();
            }
            else {
                const neverValue = action;
                throw new Error(`${neverValue} is an invalid action.`);
            }
        });
    }
    select() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentGameTitle = yield promptSelect('ゲームのタイトルを入力してください', gameTitles);
            this.currentGame = this.gameStore[this.currentGameTitle];
        });
    }
    end() {
        printLine('ゲームを終了しました');
        process.exit();
    }
}
/*** HitAndBlowクラス用の型宣言 ***/
const modes = ['normal', 'hard'];
/*** HitAndBlowクラス ***/
class HitAndBlow {
    constructor() {
        this.answerSource = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.answer = [];
        this.tryCount = 0;
        this.mode = 'normal';
    }
    // ゲームの設定
    setting() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mode = yield promptSelect('モードを入力してください', modes);
            const answerLength = this.getAnswerLength();
            while (this.answer.length < answerLength) {
                const randNum = Math.floor(Math.random() * this.answerSource.length);
                const selectedItem = this.answerSource[randNum];
                if (!this.answer.includes(selectedItem)) {
                    this.answer.push(selectedItem);
                }
            }
        });
    }
    // ゲームを開始して数値を入力する
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            const answerLength = this.getAnswerLength();
            const inputArr = (yield promptInput(`「,」区切りで${answerLength}つの数字を入力してください`)).split(',');
            const result = this.check(inputArr);
            if (!this.validate(inputArr)) {
                printLine('無効な入力です');
                yield this.play();
                return;
            }
            if (result.hit !== this.answer.length) {
                // 不正解だったら続ける
                printLine(`---\nHit: ${result.hit}\nBlow: ${result.blow}\n---`);
                this.tryCount += 1;
                yield this.play();
            }
            else {
                // 正解だったら終了
                this.tryCount += 1;
            }
        });
    }
    // 入力された数値のチェック
    check(input) {
        let hitCount = 0;
        let blowCount = 0;
        input.forEach((val, index) => {
            if (val === this.answer[index]) {
                hitCount += 1;
            }
            else if (this.answer.includes(val)) {
                blowCount += 1;
            }
        });
        return {
            hit: hitCount,
            blow: blowCount,
        };
    }
    // ゲームの終了
    end() {
        printLine(`正解です！\n試行回数: ${this.tryCount}回`);
        this.reset();
    }
    reset() {
        this.answer = [];
        this.tryCount = 0;
    }
    // 入力値のバリデーション
    validate(inputArr) {
        const isLengthValid = inputArr.length === this.answer.length;
        const isAllAnswerSourceOption = inputArr.every((val) => this.answerSource.includes(val));
        const isAllDifferentValues = inputArr.every((val, i) => inputArr.indexOf(val) === i);
        return isLengthValid && isAllAnswerSourceOption && isAllDifferentValues;
    }
    getAnswerLength() {
        switch (this.mode) {
            case 'normal':
                return 3;
            case 'hard':
                return 4;
            default:
                const neverValue = this.mode;
                throw new Error(`${neverValue}は無効なモードです`);
        }
    }
}
const jankenOptions = ['rock', 'paper', 'scissors'];
class Janken {
    constructor() {
        this.rounds = 0;
        this.currentRound = 1;
        this.result = {
            win: 0,
            lose: 0,
            draw: 0,
        };
    }
    setting() {
        return __awaiter(this, void 0, void 0, function* () {
            const rounds = Number(yield promptInput('何本勝負にしますか？'));
            if (Number.isInteger(rounds) && 0 < rounds) {
                this.rounds = rounds;
            }
            else {
                yield this.setting();
            }
        });
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            const userSelected = yield promptSelect(`【${this.currentRound}回戦】選択肢を入力してください。`, jankenOptions);
            const randomSelected = jankenOptions[Math.floor(Math.random() * 3)];
            const result = Janken.judge(userSelected, randomSelected);
            let resultText;
            switch (result) {
                case 'win':
                    this.result.win += 1;
                    resultText = '勝ち';
                    break;
                case 'lose':
                    this.result.lose += 1;
                    resultText = '負け';
                    break;
                case 'draw':
                    this.result.draw += 1;
                    resultText = 'あいこ';
                    break;
            }
            printLine(`---\nあなた: ${userSelected}\n相手${randomSelected}\n${resultText}\n---`);
            if (this.currentRound < this.rounds) {
                this.currentRound += 1;
                yield this.play();
            }
        });
    }
    end() {
        printLine(`\n${this.result.win}勝${this.result.lose}敗${this.result.draw}引き分けでした。`);
        this.reset();
    }
    reset() {
        this.rounds = 0;
        this.currentRound = 1;
        this.result = {
            win: 0,
            lose: 0,
            draw: 0,
        };
    }
    static judge(userSelected, randomSelected) {
        if (userSelected === 'rock') {
            if (randomSelected === 'rock')
                return 'draw';
            if (randomSelected === 'paper')
                return 'lose';
            return 'win';
        }
        else if (userSelected === 'paper') {
            if (randomSelected === 'rock')
                return 'win';
            if (randomSelected === 'paper')
                return 'draw';
            return 'lose';
        }
        else {
            if (randomSelected === 'rock')
                return 'lose';
            if (randomSelected === 'paper')
                return 'win';
            return 'draw';
        }
    }
}
;
(() => __awaiter(void 0, void 0, void 0, function* () {
    new GameProcedure({
        'hit and blow': new HitAndBlow(),
        'janken': new Janken()
    }).start();
}))();
